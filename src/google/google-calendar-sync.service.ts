import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { User, Event as PrismaEvent, EventChild, Child, CustodyEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthService } from './google-auth.service';
import { decrypt, encrypt } from './crypto.util';

// ── Event payload emitted by EventsService ────────────────────────────────────

export interface CalendarEventUpsertPayload {
  eventId: string;
  userId: string;
}

// ── Google Calendar color IDs (1–11) ─────────────────────────────────────────

const EVENT_TYPE_COLOR: Record<string, string> = {
  CUSTODY_TIME: '1',  // lavender (per spec: "Azul, colorId: '1'")
  SCHOOL:       '9',  // blueberry
  MEDICAL:      '11', // tomato   (per spec: "Rojo, colorId: '11'")
  ACTIVITY:     '5',  // banana
  VACATION:     '7',  // peacock
  OTHER:        '2',  // sage
};

const CUSTODY_COLOR_ID = '1'; // lavender (spec: "Azul, colorId: '1'")

type EventWithChildren = PrismaEvent & {
  children: (EventChild & { child: Child })[];
};

type CustodyEventWithChild = CustodyEvent & { child: Child };

interface CustodyBlock {
  childId: string;
  childName: string;
  custodianId: string;
  startDate: Date;
  endDate: Date;
  /** id of the first CustodyEvent in the block — googleEventId is stored here */
  anchorId: string;
  googleEventId: string | null;
}

@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly googleAuth: GoogleAuthService,
  ) {}

  // ── Listen for KidSchedule event changes ─────────────────────────────────

  @OnEvent('calendar.event.upsert', { async: true })
  async handleEventUpsert(payload: CalendarEventUpsertPayload): Promise<void> {
    const { eventId, userId } = payload;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.googleRefreshToken) return;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { children: { include: { child: true } } },
    });
    if (!event) return;

    try {
      const oauth2Client = await this.getRefreshedClient(user);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const googleEvent = this.mapToGoogleEvent(event as EventWithChildren);

      if (event.googleEventId) {
        await calendar.events.patch({
          calendarId: 'primary',
          eventId: event.googleEventId,
          requestBody: googleEvent,
        });
      } else {
        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: googleEvent,
        });
        if (response.data.id) {
          await this.prisma.event.update({
            where: { id: eventId },
            data: { googleEventId: response.data.id },
          });
        }
      }
    } catch (err) {
      this.logger.error(`Google Calendar sync failed for event ${eventId}`, err);
    }
  }

  // ── Full export: regular events + custody blocks ──────────────────────────

  async syncAllEvents(
    familyId: string,
    userId: string,
    cleanup = false,
  ): Promise<{ synced: number; custodySynced: number }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.googleRefreshToken) {
      return { synced: 0, custodySynced: 0 };
    }

    const oauth2Client = await this.getRefreshedClient(user);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const [synced, custodySynced] = await Promise.all([
      this.syncRegularEvents(familyId, calendar, cleanup),
      this.syncCustodyBlocks(familyId, calendar, cleanup),
    ]);

    return { synced, custodySynced };
  }

  // ── Regular events sync ───────────────────────────────────────────────────

  private async syncRegularEvents(
    familyId: string,
    calendar: ReturnType<typeof google.calendar>,
    cleanup: boolean,
  ): Promise<number> {
    const events = await this.prisma.event.findMany({
      where: { familyId, startAt: { gte: new Date() } },
      include: { children: { include: { child: true } } },
    });

    if (cleanup) {
      await this.deleteGoogleEventsBatch(
        calendar,
        events.filter((e) => e.googleEventId).map((e) => e.googleEventId!),
      );
      await this.prisma.event.updateMany({
        where: { familyId, googleEventId: { not: null } },
        data: { googleEventId: null },
      });
      // Reload after nulling IDs so all events get re-created
      events.forEach((e) => (e.googleEventId = null));
    }

    let synced = 0;
    const BATCH = 5;
    for (let i = 0; i < events.length; i += BATCH) {
      await Promise.all(
        events.slice(i, i + BATCH).map(async (event) => {
          try {
            const googleEvent = this.mapToGoogleEvent(event as EventWithChildren);
            if (event.googleEventId) {
              await calendar.events.patch({
                calendarId: 'primary',
                eventId: event.googleEventId,
                requestBody: googleEvent,
              });
            } else {
              const res = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: googleEvent,
              });
              if (res.data.id) {
                await this.prisma.event.update({
                  where: { id: event.id },
                  data: { googleEventId: res.data.id },
                });
              }
            }
            synced++;
          } catch (err) {
            this.logger.warn(`Skipped event ${event.id} during export: ${err}`);
          }
        }),
      );
    }
    return synced;
  }

  // ── Custody block sync ────────────────────────────────────────────────────

  private async syncCustodyBlocks(
    familyId: string,
    calendar: ReturnType<typeof google.calendar>,
    cleanup: boolean,
  ): Promise<number> {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const custodyEvents = await this.prisma.custodyEvent.findMany({
      where: {
        familyId,
        date: { gte: new Date(), lte: sixMonthsFromNow },
      },
      include: { child: true },
      orderBy: [{ childId: 'asc' }, { date: 'asc' }],
    });

    if (cleanup) {
      const existingGoogleIds = custodyEvents
        .filter((e) => e.googleEventId)
        .map((e) => e.googleEventId!);
      await this.deleteGoogleEventsBatch(calendar, existingGoogleIds);
      await this.prisma.custodyEvent.updateMany({
        where: { familyId, googleEventId: { not: null } },
        data: { googleEventId: null },
      });
      custodyEvents.forEach((e) => (e.googleEventId = null));
    }

    const blocks = this.groupCustodyBlocks(custodyEvents as CustodyEventWithChild[]);

    let synced = 0;
    const BATCH = 5;
    for (let i = 0; i < blocks.length; i += BATCH) {
      await Promise.all(
        blocks.slice(i, i + BATCH).map(async (block) => {
          try {
            const googleEvent = this.mapCustodyBlockToGoogleEvent(block);
            if (block.googleEventId) {
              await calendar.events.patch({
                calendarId: 'primary',
                eventId: block.googleEventId,
                requestBody: googleEvent,
              });
            } else {
              const res = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: googleEvent,
              });
              if (res.data.id) {
                await this.prisma.custodyEvent.update({
                  where: { id: block.anchorId },
                  data: { googleEventId: res.data.id },
                });
              }
            }
            synced++;
          } catch (err) {
            this.logger.warn(`Skipped custody block ${block.anchorId} during export: ${err}`);
          }
        }),
      );
    }
    return synced;
  }

  // ── Group consecutive custody days into blocks ────────────────────────────

  private groupCustodyBlocks(events: CustodyEventWithChild[]): CustodyBlock[] {
    const blocks: CustodyBlock[] = [];
    const ONE_DAY_MS = 86_400_000;

    for (const ev of events) {
      const last = blocks[blocks.length - 1];
      const isConsecutive =
        last &&
        last.childId === ev.childId &&
        last.custodianId === ev.custodianId &&
        ev.date.getTime() - last.endDate.getTime() <= ONE_DAY_MS + 1000; // 1ms tolerance

      if (isConsecutive) {
        last.endDate = ev.date;
      } else {
        blocks.push({
          childId: ev.childId,
          childName: ev.child.firstName,
          custodianId: ev.custodianId,
          startDate: ev.date,
          endDate: ev.date,
          anchorId: ev.id,
          googleEventId: ev.googleEventId ?? null,
        });
      }
    }

    return blocks;
  }

  // ── Delete a list of Google event IDs, ignoring 404s ─────────────────────

  private async deleteGoogleEventsBatch(
    calendar: ReturnType<typeof google.calendar>,
    googleEventIds: string[],
  ): Promise<void> {
    const BATCH = 5;
    for (let i = 0; i < googleEventIds.length; i += BATCH) {
      await Promise.all(
        googleEventIds.slice(i, i + BATCH).map((id) =>
          calendar.events
            .delete({ calendarId: 'primary', eventId: id })
            .catch(() => {}), // ignore 404 / already deleted
        ),
      );
    }
  }

  // ── Token rotation ────────────────────────────────────────────────────────

  private async getRefreshedClient(user: User) {
    const encKey = this.config.getOrThrow<string>('GOOGLE_TOKEN_ENCRYPTION_KEY');
    const oauth2Client = this.googleAuth.createOAuth2Client();

    oauth2Client.setCredentials({
      access_token: decrypt(user.googleAccessToken!, encKey),
      refresh_token: decrypt(user.googleRefreshToken!, encKey),
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    const fiveMinutes = 5 * 60 * 1000;
    const needsRefresh =
      !user.googleTokenExpiry ||
      user.googleTokenExpiry.getTime() < Date.now() + fiveMinutes;

    if (needsRefresh) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...(credentials.access_token && {
            googleAccessToken: encrypt(credentials.access_token, encKey),
          }),
          ...(credentials.expiry_date && {
            googleTokenExpiry: new Date(credentials.expiry_date),
          }),
        },
      });
      oauth2Client.setCredentials(credentials);
    }

    return oauth2Client;
  }

  // ── Map regular event → Google Calendar resource ──────────────────────────

  private mapToGoogleEvent(event: EventWithChildren) {
    const childNames = event.children.map((ec) => ec.child.firstName).join(', ');
    const description = [
      childNames ? `Children: ${childNames}` : null,
      event.notes ?? null,
      `\n— Synced from KidSchedule`,
    ]
      .filter(Boolean)
      .join('\n');

    const base = {
      summary: event.title,
      description,
      colorId: EVENT_TYPE_COLOR[event.type] ?? '2',
    };

    if (event.allDay) {
      const dateStr = event.startAt.toISOString().slice(0, 10);
      const endDateStr = new Date(event.endAt.getTime() + 86_400_000)
        .toISOString()
        .slice(0, 10);
      return { ...base, start: { date: dateStr }, end: { date: endDateStr } };
    }

    return {
      ...base,
      start: { dateTime: event.startAt.toISOString() },
      end: { dateTime: event.endAt.toISOString() },
    };
  }

  // ── Map custody block → Google Calendar resource ──────────────────────────

  private mapCustodyBlockToGoogleEvent(block: CustodyBlock) {
    // Google Calendar all-day events use exclusive end date (day after last day)
    const endDate = new Date(block.endDate.getTime() + 86_400_000);

    return {
      summary: `Custody: ${block.childName}`,
      description: `Synchronized from KidSchedule`,
      colorId: CUSTODY_COLOR_ID,
      start: { date: block.startDate.toISOString().slice(0, 10) },
      end: { date: endDate.toISOString().slice(0, 10) },
    };
  }
}
