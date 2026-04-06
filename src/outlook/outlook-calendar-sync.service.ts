import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { User, Event as PrismaEvent, EventChild, Child, CustodyEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OutlookAuthService } from './outlook-auth.service';
import type { CalendarEventUpsertPayload } from '../google/google-calendar-sync.service';

const GRAPH = 'https://graph.microsoft.com/v1.0';
const CALENDAR_NAME = 'KidSchedule';

// Outlook calendar color names (16 supported values)
const EVENT_TYPE_CATEGORY: Record<string, string> = {
  CUSTODY_TIME: 'Blue Category',
  SCHOOL:       'Green Category',
  MEDICAL:      'Red Category',
  ACTIVITY:     'Yellow Category',
  VACATION:     'Teal Category',
  OTHER:        'Gray Category',
};

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
  outlookEventId: string | null;
}

@Injectable()
export class OutlookCalendarSyncService {
  private readonly logger = new Logger(OutlookCalendarSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly outlookAuth: OutlookAuthService,
  ) {}

  // ── Live sync on individual event save ───────────────────────────────────

  @OnEvent('calendar.event.upsert', { async: true })
  async handleEventUpsert(payload: CalendarEventUpsertPayload): Promise<void> {
    const { eventId, userId } = payload;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.outlookRefreshToken) return;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { children: { include: { child: true } } },
    });
    if (!event) return;

    try {
      const accessToken = await this.outlookAuth.getValidAccessToken(userId);
      const calendarId  = await this.getOrCreateKidScheduleCalendar(accessToken, user);
      const outlookEvent = this.mapToOutlookEvent(event as EventWithChildren);
      const newId = await this.upsertOutlookEvent(accessToken, calendarId, event.outlookEventId, outlookEvent);
      if (newId && newId !== event.outlookEventId) {
        await this.prisma.event.update({ where: { id: eventId }, data: { outlookEventId: newId } });
      }
    } catch (err) {
      this.logger.error(`Outlook Calendar sync failed for event ${eventId}`, err);
    }
  }

  // ── Full export: regular events + custody blocks ──────────────────────────

  async syncAllEvents(
    familyId: string,
    userId: string,
    cleanup = false,
  ): Promise<{ synced: number; custodySynced: number }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.outlookRefreshToken) return { synced: 0, custodySynced: 0 };

    const accessToken = await this.outlookAuth.getValidAccessToken(userId);
    const calendarId  = await this.getOrCreateKidScheduleCalendar(accessToken, user);

    const [synced, custodySynced] = await Promise.all([
      this.syncRegularEvents(familyId, accessToken, calendarId, cleanup),
      this.syncCustodyBlocks(familyId, accessToken, calendarId, cleanup),
    ]);

    this.logger.log(`Outlook export done — regular: ${synced}, custody blocks: ${custodySynced}`);
    return { synced, custodySynced };
  }

  // ── Get or create the dedicated "KidSchedule" Outlook calendar ────────────

  private async getOrCreateKidScheduleCalendar(accessToken: string, user: User): Promise<string> {
    if (user.outlookCalendarId) {
      const res = await fetch(`${GRAPH}/me/calendars/${user.outlookCalendarId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) return user.outlookCalendarId;
      // Calendar deleted externally — fall through to recreate
    }

    const res = await fetch(`${GRAPH}/me/calendars`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: CALENDAR_NAME }),
    });

    if (!res.ok) throw new Error(`Failed to create Outlook calendar: ${await res.text()}`);

    const calendar = (await res.json()) as { id: string };
    await this.prisma.user.update({
      where: { id: user.id },
      data: { outlookCalendarId: calendar.id },
    });
    user.outlookCalendarId = calendar.id;

    this.logger.log(`Created KidSchedule Outlook calendar: ${calendar.id}`);
    return calendar.id;
  }

  // ── Regular events sync ───────────────────────────────────────────────────

  private async syncRegularEvents(
    familyId: string,
    accessToken: string,
    calendarId: string,
    cleanup: boolean,
  ): Promise<number> {
    const events = await this.prisma.event.findMany({
      where: { familyId, startAt: { gte: new Date() } },
      include: { children: { include: { child: true } } },
    });

    if (cleanup) {
      await this.deleteOutlookEventsBatch(
        accessToken,
        calendarId,
        events.filter((e) => e.outlookEventId).map((e) => e.outlookEventId!),
      );
      await this.prisma.event.updateMany({
        where: { familyId, outlookEventId: { not: null } },
        data: { outlookEventId: null },
      });
      events.forEach((e) => (e.outlookEventId = null));
    }

    let synced = 0;
    const BATCH = 5;
    for (let i = 0; i < events.length; i += BATCH) {
      await Promise.all(
        events.slice(i, i + BATCH).map(async (event) => {
          try {
            const outlookEvent = this.mapToOutlookEvent(event as EventWithChildren);
            const newId = await this.upsertOutlookEvent(accessToken, calendarId, event.outlookEventId, outlookEvent);
            if (newId && newId !== event.outlookEventId) {
              await this.prisma.event.update({ where: { id: event.id }, data: { outlookEventId: newId } });
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
    accessToken: string,
    calendarId: string,
    cleanup: boolean,
  ): Promise<number> {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const custodyEvents = await this.prisma.custodyEvent.findMany({
      where: { familyId, date: { gte: new Date(), lte: sixMonthsFromNow } },
      include: { child: true },
      orderBy: [{ childId: 'asc' }, { date: 'asc' }],
    });

    if (cleanup) {
      await this.deleteOutlookEventsBatch(
        accessToken,
        calendarId,
        custodyEvents.filter((e) => e.outlookEventId).map((e) => e.outlookEventId!),
      );
      await this.prisma.custodyEvent.updateMany({
        where: { familyId, outlookEventId: { not: null } },
        data: { outlookEventId: null },
      });
      custodyEvents.forEach((e) => (e.outlookEventId = null));
    }

    const blocks = this.groupCustodyBlocks(custodyEvents as CustodyEventWithChild[]);
    let synced = 0;
    const BATCH = 5;

    for (let i = 0; i < blocks.length; i += BATCH) {
      await Promise.all(
        blocks.slice(i, i + BATCH).map(async (block) => {
          try {
            const outlookEvent = this.mapCustodyBlockToOutlookEvent(block);
            const newId = await this.upsertOutlookEvent(accessToken, calendarId, block.outlookEventId, outlookEvent);
            if (newId && newId !== block.outlookEventId) {
              await this.prisma.custodyEvent.update({
                where: { id: block.anchorId },
                data: { outlookEventId: newId },
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
          childId:        ev.childId,
          childName:      ev.child.firstName,
          custodianId:    ev.custodianId,
          startDate:      ev.date,
          endDate:        ev.date,
          anchorId:       ev.id,
          outlookEventId: ev.outlookEventId ?? null,
        });
      }
    }
    return blocks;
  }

  // ── Insert or update an Outlook event, falling back to insert on 404 ──────

  private async upsertOutlookEvent(
    accessToken: string,
    calendarId: string,
    existingId: string | null,
    body: object,
  ): Promise<string | null> {
    if (existingId) {
      const res = await fetch(`${GRAPH}/me/calendars/${calendarId}/events/${existingId}`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (res.ok) return existingId;
      if (res.status !== 404) throw new Error(`Outlook PATCH failed: ${res.status}`);
      // 404 — event deleted externally, fall through to insert
    }

    const res = await fetch(`${GRAPH}/me/calendars/${calendarId}/events`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Outlook INSERT failed: ${res.status}`);
    const data = (await res.json()) as { id: string };
    return data.id;
  }

  // ── Batch-delete Outlook events ───────────────────────────────────────────

  private async deleteOutlookEventsBatch(
    accessToken: string,
    calendarId: string,
    eventIds: string[],
  ): Promise<void> {
    const BATCH = 5;
    for (let i = 0; i < eventIds.length; i += BATCH) {
      await Promise.all(
        eventIds.slice(i, i + BATCH).map((id) =>
          fetch(`${GRAPH}/me/calendars/${calendarId}/events/${id}`, {
            method:  'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          }).catch(() => {}),
        ),
      );
    }
  }

  // ── Map KidSchedule event → Outlook/Graph event body ─────────────────────

  private mapToOutlookEvent(event: EventWithChildren): object {
    const childNames = event.children.map((ec) => ec.child.firstName).join(', ');
    const notes = [
      childNames ? `Children: ${childNames}` : null,
      event.notes ?? null,
      '— Synced from KidSchedule',
    ]
      .filter(Boolean)
      .join('\n');

    const category = EVENT_TYPE_CATEGORY[event.type] ?? 'Gray Category';

    if (event.allDay) {
      const endDate = new Date(event.endAt.getTime() + 86_400_000);
      return {
        subject: event.title,
        body: { contentType: 'text', content: notes },
        isAllDay: true,
        start: { dateTime: this.toOutlookDate(event.startAt), timeZone: 'UTC' },
        end:   { dateTime: this.toOutlookDate(endDate),        timeZone: 'UTC' },
        categories: [category],
      };
    }

    return {
      subject: event.title,
      body: { contentType: 'text', content: notes },
      isAllDay: false,
      start: { dateTime: event.startAt.toISOString().replace('Z', ''), timeZone: 'UTC' },
      end:   { dateTime: event.endAt.toISOString().replace('Z', ''),   timeZone: 'UTC' },
      categories: [category],
    };
  }

  // ── Map custody block → Outlook event body ────────────────────────────────

  private mapCustodyBlockToOutlookEvent(block: CustodyBlock): object {
    const endDate = new Date(block.endDate.getTime() + 86_400_000);
    return {
      subject:    `Custody: ${block.childName}`,
      body:       { contentType: 'text', content: 'Synchronized from KidSchedule' },
      isAllDay:   true,
      start:      { dateTime: this.toOutlookDate(block.startDate), timeZone: 'UTC' },
      end:        { dateTime: this.toOutlookDate(endDate),          timeZone: 'UTC' },
      categories: ['Blue Category'],
    };
  }

  // Outlook all-day events need "YYYY-MM-DDT00:00:00.000" (no Z suffix)
  private toOutlookDate(d: Date): string {
    return d.toISOString().slice(0, 19) + '.000';
  }
}
