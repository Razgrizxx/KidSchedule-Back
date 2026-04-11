import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { User, Event as PrismaEvent, EventChild, Child, CustodyEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthService } from './google-auth.service';
import { ChatGateway } from '../messaging/chat.gateway';
import { decrypt, encrypt } from './crypto.util';

// ── Event payload emitted by EventsService ────────────────────────────────────

export interface CalendarEventUpsertPayload {
  eventId: string;
  userId: string;
}

// ── Google Calendar color IDs for event types ─────────────────────────────────

const EVENT_TYPE_COLOR: Record<string, string> = {
  CUSTODY_TIME: '9',  // blueberry — overridden by per-child color on full export
  SCHOOL:       '2',  // sage
  MEDICAL:      '11', // tomato  (spec: "Rojo, colorId: '11'")
  ACTIVITY:     '5',  // banana
  VACATION:     '7',  // peacock
  OTHER:        '8',  // graphite
};

// ── Per-child color palette (visually distinct, cycling if > 11 children) ─────
// Ordered for maximum contrast between adjacent slots.

const CHILD_COLOR_PALETTE = [
  '9',  // blueberry  (dark blue)
  '11', // tomato     (red)
  '5',  // banana     (yellow)
  '7',  // peacock    (teal)
  '3',  // grape      (purple)
  '6',  // tangerine  (orange)
  '10', // basil      (dark green)
  '4',  // flamingo   (pink)
  '2',  // sage       (light green)
  '1',  // lavender
  '8',  // graphite
];

// ── KidSchedule dedicated calendar ───────────────────────────────────────────

const KIDSCHEDULE_CALENDAR_NAME = 'KidSchedule';

type GCalendar = ReturnType<typeof google.calendar>;
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
    private readonly chatGateway: ChatGateway,
  ) {}

  // ── Live sync on individual event save ───────────────────────────────────

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
      const calendarId = await this.getOrCreateKidScheduleCalendar(calendar, user);
      const googleEvent = this.mapToGoogleEvent(event as EventWithChildren);
      const newId = await this.upsertGoogleEvent(calendar, calendarId, event.googleEventId, googleEvent);
      if (newId && newId !== event.googleEventId) {
        await this.prisma.event.update({ where: { id: eventId }, data: { googleEventId: newId } });
      }
    } catch (err: any) {
      this.logger.error(`Google Calendar sync failed for event ${eventId}`, err);
      // Notify the user via WebSocket if the token is expired/revoked
      if (err?.response?.data?.error === 'invalid_grant' || err?.cause?.message === 'invalid_grant') {
        this.chatGateway.emitToFamily(event.familyId, 'notification', {
          type: 'GOOGLE_SYNC_ERROR',
          payload: { userId },
        });
      }
    }
  }

  // ── Full export: regular events + custody blocks ──────────────────────────

  async syncAllEvents(
    familyId: string,
    userId: string,
    cleanup = false,
  ): Promise<{ synced: number; custodySynced: number }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.googleRefreshToken) return { synced: 0, custodySynced: 0 };

    const oauth2Client = await this.getRefreshedClient(user);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarId = await this.getOrCreateKidScheduleCalendar(calendar, user);
    const childColorMap = await this.buildChildColorMap(familyId);

    this.logger.log(`Export started — calendarId: ${calendarId}, cleanup: ${cleanup}, childColorMap: ${JSON.stringify(childColorMap)}`);

    const [synced, custodySynced] = await Promise.all([
      this.syncRegularEvents(familyId, calendar, calendarId, cleanup),
      this.syncCustodyBlocks(familyId, calendar, calendarId, childColorMap, cleanup),
    ]);

    this.logger.log(`Export done — regular: ${synced}, custody blocks: ${custodySynced}`);
    return { synced, custodySynced };
  }

  // ── Get or create the dedicated "KidSchedule" Google Calendar ─────────────

  private async getOrCreateKidScheduleCalendar(calendar: GCalendar, user: User): Promise<string> {
    // Try stored calendar ID first
    if (user.googleCalendarId) {
      try {
        await calendar.calendarList.get({ calendarId: user.googleCalendarId });
        return user.googleCalendarId;
      } catch {
        // Calendar was deleted externally — fall through to recreate
      }
    }

    // Create a new dedicated calendar
    const created = await calendar.calendars.insert({
      requestBody: {
        summary: KIDSCHEDULE_CALENDAR_NAME,
        description: 'Family custody schedule and events synced from KidSchedule',
      },
    });

    const calendarId = created.data.id!;

    // Set a recognisable color on the calendar entry in the user's list
    await calendar.calendarList.patch({
      calendarId,
      requestBody: { backgroundColor: '#0B8043', foregroundColor: '#ffffff' },
    }).catch(() => {}); // non-critical

    // Persist so we reuse it on the next sync
    await this.prisma.user.update({
      where: { id: user.id },
      data: { googleCalendarId: calendarId },
    });

    // Mutate the in-memory object so callers see the new ID without a re-fetch
    user.googleCalendarId = calendarId;

    this.logger.log(`Created KidSchedule calendar: ${calendarId}`);
    return calendarId;
  }

  // ── Build a map of childId → colorId (stable, by creation order) ──────────

  private async buildChildColorMap(familyId: string): Promise<Record<string, string>> {
    const children = await this.prisma.child.findMany({
      where: { familyId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    return Object.fromEntries(
      children.map((child, idx) => [
        child.id,
        CHILD_COLOR_PALETTE[idx % CHILD_COLOR_PALETTE.length],
      ]),
    );
  }

  // ── Regular events sync ───────────────────────────────────────────────────

  private async syncRegularEvents(
    familyId: string,
    calendar: GCalendar,
    calendarId: string,
    cleanup: boolean,
  ): Promise<number> {
    const events = await this.prisma.event.findMany({
      where: { familyId, startAt: { gte: new Date() } },
      include: { children: { include: { child: true } } },
    });

    this.logger.log(`Regular events found: ${events.length}`);

    if (cleanup) {
      await this.deleteGoogleEventsBatch(
        calendar,
        calendarId,
        events.filter((e) => e.googleEventId).map((e) => e.googleEventId!),
      );
      await this.prisma.event.updateMany({
        where: { familyId, googleEventId: { not: null } },
        data: { googleEventId: null },
      });
      events.forEach((e) => (e.googleEventId = null));
    }

    let synced = 0;
    const BATCH = 5;
    for (let i = 0; i < events.length; i += BATCH) {
      await Promise.all(
        events.slice(i, i + BATCH).map(async (event) => {
          try {
            const googleEvent = this.mapToGoogleEvent(event as EventWithChildren);
            const newId = await this.upsertGoogleEvent(calendar, calendarId, event.googleEventId, googleEvent);
            if (newId && newId !== event.googleEventId) {
              await this.prisma.event.update({ where: { id: event.id }, data: { googleEventId: newId } });
            }
            synced++;
          } catch (err) {
            this.logger.warn(`Skipped event ${event.id}: ${err}`);
          }
        }),
      );
    }
    return synced;
  }

  // ── Custody block sync ────────────────────────────────────────────────────

  private async syncCustodyBlocks(
    familyId: string,
    calendar: GCalendar,
    calendarId: string,
    childColorMap: Record<string, string>,
    cleanup: boolean,
  ): Promise<number> {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const custodyEvents = await this.prisma.custodyEvent.findMany({
      where: { familyId, date: { gte: new Date(), lte: sixMonthsFromNow } },
      include: { child: true },
      orderBy: [{ childId: 'asc' }, { date: 'asc' }],
    });

    this.logger.log(`Custody events found: ${custodyEvents.length}, date range: now → ${sixMonthsFromNow.toISOString()}`);

    if (cleanup) {
      await this.deleteGoogleEventsBatch(
        calendar,
        calendarId,
        custodyEvents.filter((e) => e.googleEventId).map((e) => e.googleEventId!),
      );
      await this.prisma.custodyEvent.updateMany({
        where: { familyId, googleEventId: { not: null } },
        data: { googleEventId: null },
      });
      custodyEvents.forEach((e) => (e.googleEventId = null));
    }

    const blocks = this.groupCustodyBlocks(custodyEvents as CustodyEventWithChild[]);
    this.logger.log(`Custody blocks grouped: ${blocks.length}`);

    let synced = 0;
    const BATCH = 5;
    for (let i = 0; i < blocks.length; i += BATCH) {
      await Promise.all(
        blocks.slice(i, i + BATCH).map(async (block) => {
          try {
            const colorId = childColorMap[block.childId] ?? '9';
            const googleEvent = this.mapCustodyBlockToGoogleEvent(block, colorId);
            const newId = await this.upsertGoogleEvent(calendar, calendarId, block.googleEventId, googleEvent);
            if (newId && newId !== block.googleEventId) {
              await this.prisma.custodyEvent.update({
                where: { id: block.anchorId },
                data: { googleEventId: newId },
              });
            }
            synced++;
          } catch (err) {
            this.logger.warn(`Skipped custody block ${block.anchorId}: ${err}`);
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
        ev.date.getTime() - last.endDate.getTime() <= ONE_DAY_MS + 1000;

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

  // ── Insert or update a Google Calendar event, falling back to insert on 404 ─

  private async upsertGoogleEvent(
    calendar: GCalendar,
    calendarId: string,
    existingId: string | null,
    requestBody: object,
  ): Promise<string | null> {
    if (existingId) {
      try {
        await calendar.events.patch({ calendarId, eventId: existingId, requestBody });
        return existingId;
      } catch (err: any) {
        // 404 means the event was deleted or is in a different calendar — fall through to insert
        if (err?.code !== 404 && err?.status !== 404) throw err;
      }
    }
    const res = await calendar.events.insert({ calendarId, requestBody });
    return res.data.id ?? null;
  }

  // ── Batch-delete Google events, silently ignoring 404s ───────────────────

  private async deleteGoogleEventsBatch(
    calendar: GCalendar,
    calendarId: string,
    googleEventIds: string[],
  ): Promise<void> {
    const BATCH = 5;
    for (let i = 0; i < googleEventIds.length; i += BATCH) {
      await Promise.all(
        googleEventIds
          .slice(i, i + BATCH)
          .map((id) =>
            calendar.events.delete({ calendarId, eventId: id }).catch(() => {}),
          ),
      );
    }
  }

  // ── Token rotation ────────────────────────────────────────────────────────

  private async getRefreshedClient(user: User) {
    if (!user.googleAccessToken || !user.googleRefreshToken) {
      throw new Error(`Google tokens missing for user ${user.id} — integration may have been disconnected`);
    }

    const encKey = this.config.getOrThrow<string>('GOOGLE_TOKEN_ENCRYPTION_KEY');
    const oauth2Client = this.googleAuth.createOAuth2Client();

    oauth2Client.setCredentials({
      access_token: decrypt(user.googleAccessToken, encKey),
      refresh_token: decrypt(user.googleRefreshToken, encKey),
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

  // ── Map regular KidSchedule event → Google Calendar resource ─────────────

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
      colorId: EVENT_TYPE_COLOR[event.type] ?? '8',
    };

    if (event.allDay) {
      return {
        ...base,
        start: { date: event.startAt.toISOString().slice(0, 10) },
        end: { date: new Date(event.endAt.getTime() + 86_400_000).toISOString().slice(0, 10) },
      };
    }

    return {
      ...base,
      start: { dateTime: event.startAt.toISOString() },
      end: { dateTime: event.endAt.toISOString() },
    };
  }

  // ── Map custody block → Google Calendar resource (per-child color) ────────

  private mapCustodyBlockToGoogleEvent(block: CustodyBlock, colorId: string) {
    return {
      summary: `Custody: ${block.childName}`,
      description: `Synchronized from KidSchedule`,
      colorId,
      start: { date: block.startDate.toISOString().slice(0, 10) },
      // Google all-day end date is exclusive (day after last day)
      end: { date: new Date(block.endDate.getTime() + 86_400_000).toISOString().slice(0, 10) },
    };
  }
}
