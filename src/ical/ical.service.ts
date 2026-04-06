import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IcalService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Generate or return the feed token for a user ─────────────────────────

  async getOrCreateFeedToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where:  { id: userId },
      select: { icalFeedToken: true },
    });

    if (user.icalFeedToken) return user.icalFeedToken;

    const token = randomBytes(32).toString('hex');
    await this.prisma.user.update({ where: { id: userId }, data: { icalFeedToken: token } });
    return token;
  }

  // ── Rotate the token (invalidates existing subscriptions) ─────────────────

  async rotateFeedToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.prisma.user.update({ where: { id: userId }, data: { icalFeedToken: token } });
    return token;
  }

  // ── Generate the .ics feed content ────────────────────────────────────────

  async generateFeed(token: string): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where:  { icalFeedToken: token },
      select: { id: true, familyMemberships: { select: { familyId: true } } },
    });

    if (!user) throw new NotFoundException('Feed not found');

    const familyId = user.familyMemberships[0]?.familyId;
    if (!familyId) return this.buildCalendar([]);

    // Fetch upcoming SHARED events for the family
    const events = await this.prisma.event.findMany({
      where: {
        familyId,
        startAt:    { gte: new Date() },
        visibility: 'SHARED',
      },
      include: { children: { include: { child: { select: { firstName: true } } } } },
      orderBy: { startAt: 'asc' },
    });

    // Also include upcoming custody blocks (next 6 months)
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    const custodyEvents = await this.prisma.custodyEvent.findMany({
      where:   { familyId, date: { gte: new Date(), lte: sixMonths } },
      include: { child: { select: { firstName: true } } },
      orderBy: { date: 'asc' },
    });

    const lines: string[] = [];

    // Regular events
    for (const ev of events) {
      const childNames = ev.children.map((ec) => ec.child.firstName).join(', ');
      const desc = [
        childNames ? `Children: ${childNames}` : null,
        ev.notes ?? null,
        'Synced from KidSchedule',
      ]
        .filter(Boolean)
        .join('\\n');

      if (ev.allDay) {
        lines.push(
          'BEGIN:VEVENT',
          `UID:ks-${ev.id}@kidschedule`,
          `DTSTAMP:${this.toIcalStamp(new Date())}`,
          `DTSTART;VALUE=DATE:${this.toIcalDate(ev.startAt)}`,
          `DTEND;VALUE=DATE:${this.toIcalDate(new Date(ev.endAt.getTime() + 86_400_000))}`,
          `SUMMARY:${this.escape(ev.title)}`,
          ...(desc ? [`DESCRIPTION:${this.escape(desc)}`] : []),
          'END:VEVENT',
        );
      } else {
        lines.push(
          'BEGIN:VEVENT',
          `UID:ks-${ev.id}@kidschedule`,
          `DTSTAMP:${this.toIcalStamp(new Date())}`,
          `DTSTART:${this.toIcalStamp(ev.startAt)}`,
          `DTEND:${this.toIcalStamp(ev.endAt)}`,
          `SUMMARY:${this.escape(ev.title)}`,
          ...(desc ? [`DESCRIPTION:${this.escape(desc)}`] : []),
          'END:VEVENT',
        );
      }
    }

    // Custody events — group consecutive same-child/custodian days into blocks
    const blocks = this.groupCustodyBlocks(custodyEvents as any[]);
    for (const block of blocks) {
      const endDate = new Date(block.endDate.getTime() + 86_400_000);
      lines.push(
        'BEGIN:VEVENT',
        `UID:ks-custody-${block.anchorId}@kidschedule`,
        `DTSTAMP:${this.toIcalStamp(new Date())}`,
        `DTSTART;VALUE=DATE:${this.toIcalDate(block.startDate)}`,
        `DTEND;VALUE=DATE:${this.toIcalDate(endDate)}`,
        `SUMMARY:Custody: ${this.escape(block.childName)}`,
        'DESCRIPTION:Synchronized from KidSchedule',
        'END:VEVENT',
      );
    }

    return this.buildCalendar(lines);
  }

  // ── Group consecutive custody days (same logic as Google/Outlook sync) ────

  private groupCustodyBlocks(events: any[]) {
    const blocks: any[] = [];
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
          childId:    ev.childId,
          childName:  ev.child.firstName,
          custodianId: ev.custodianId,
          startDate:  ev.date,
          endDate:    ev.date,
          anchorId:   ev.id,
        });
      }
    }
    return blocks;
  }

  // ── iCal format helpers ───────────────────────────────────────────────────

  private buildCalendar(eventLines: string[]): string {
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KidSchedule//KidSchedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:KidSchedule',
      'X-WR-CALDESC:Your KidSchedule family calendar',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
      ...eventLines,
      'END:VCALENDAR',
    ].join('\r\n');
  }

  /** "20240115T120000Z" */
  private toIcalStamp(d: Date): string {
    return d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  }

  /** "20240115" */
  private toIcalDate(d: Date): string {
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  }

  /** Escape special iCal characters */
  private escape(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }
}
