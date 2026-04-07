import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType, EventVisibility, Prisma } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { BulkImportDto, CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { getHolidaysForYear } from './holidays.data';
import type { CalendarEventUpsertPayload } from '../google/google-calendar-sync.service';

@Injectable()
export class EventsService {
  private readonly anthropic = new Anthropic();

  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private eventEmitter: EventEmitter2,
    private notifications: NotificationsService,
    private audit: AuditService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateEventDto) {
    await this.familyService.assertMember(familyId, userId);
    const { childIds, ...rest } = dto;
    const event = await this.prisma.event.create({
      data: {
        familyId,
        createdBy: userId,
        ...rest,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        children: {
          create: childIds.map((childId) => ({ childId })),
        },
      },
      include: {
        children: { include: { child: { select: { id: true, firstName: true, lastName: true, color: true } } } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        caregiver: { select: { id: true, name: true } },
      },
    });
    this.eventEmitter.emit('calendar.event.upsert', {
      eventId: event.id,
      userId,
    } satisfies CalendarEventUpsertPayload);

    // Push notification to co-parent (fire-and-forget)
    const dateStr = new Date(dto.startAt).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short',
    });
    void this.notifications.sendToFamily(familyId, userId, {
      title: `Nuevo evento: ${event.title}`,
      body: `${dateStr} · ${event.type.toLowerCase().replace(/_/g, ' ')}`,
      data: { type: 'EVENT', familyId, eventId: event.id },
    }).catch(() => {});

    void this.audit.log({
      familyId,
      actorId:     userId,
      action:      'EVENT_CREATED',
      affectedDate: event.startAt,
      eventId:     event.id,
      newValue:    event.title,
    });

    return event;
  }

  async findAll(familyId: string, userId: string, month?: string) {
    await this.familyService.assertMember(familyId, userId);

    const where: Prisma.EventWhereInput = { familyId };

    if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end = new Date(Date.UTC(y, m, 1));
      where.startAt = { gte: start, lt: end };
    }

    return this.prisma.event.findMany({
      where,
      orderBy: { startAt: 'asc' },
      include: {
        children: { include: { child: { select: { id: true, firstName: true, lastName: true, color: true } } } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        caregiver: { select: { id: true, name: true } },
      },
    });
  }

  async update(familyId: string, eventId: string, userId: string, dto: UpdateEventDto) {
    await this.familyService.assertMember(familyId, userId);
    const { childIds, startAt, endAt, ...rest } = dto;

    const event = await this.prisma.$transaction(async (tx) => {
      if (childIds !== undefined) {
        await tx.eventChild.deleteMany({ where: { eventId } });
        await tx.eventChild.createMany({
          data: childIds.map((childId) => ({ eventId, childId })),
        });
      }
      return tx.event.update({
        where: { id: eventId, familyId },
        data: {
          ...rest,
          ...(startAt && { startAt: new Date(startAt) }),
          ...(endAt && { endAt: new Date(endAt) }),
        },
        include: {
          children: { include: { child: { select: { id: true, firstName: true, lastName: true, color: true } } } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });
    this.eventEmitter.emit('calendar.event.upsert', {
      eventId: event.id,
      userId,
    } satisfies CalendarEventUpsertPayload);

    void this.audit.log({
      familyId,
      actorId:     userId,
      action:      'EVENT_UPDATED',
      affectedDate: event.startAt,
      eventId:     event.id,
      newValue:    event.title,
    });

    return event;
  }

  async getHolidays(familyId: string, userId: string, year: number, country?: string) {
    await this.familyService.assertMember(familyId, userId);

    const settings = await this.prisma.familySettings.findUnique({ where: { familyId } });
    const transitionDay = settings?.transitionDay ?? 'MONDAY';
    const DAY_MAP: Record<string, number> = {
      SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
    };
    const transitionDayNum = DAY_MAP[transitionDay] ?? 1;

    const all = getHolidaysForYear(year);
    const filtered = country ? all.filter((h) => h.country === country) : all;

    return filtered.map((h) => ({
      ...h,
      // Parse date at noon UTC to avoid timezone off-by-one
      isTransitionDay: new Date(h.date + 'T12:00:00Z').getDay() === transitionDayNum,
    }));
  }

  async bulkCreate(familyId: string, userId: string, dto: BulkImportDto) {
    await this.familyService.assertMember(familyId, userId);

    let created = 0;
    let skipped = 0;

    const timeRegex = /^\d{2}:\d{2}$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    for (const item of dto.events) {
      if (!dateRegex.test(item.date)) { skipped++; continue; }
      const hasTime = !!item.startTime && timeRegex.test(item.startTime);
      const startAt = hasTime
        ? new Date(`${item.date}T${item.startTime}:00.000Z`)
        : new Date(item.date + 'T00:00:00.000Z');
      const endAt = hasTime
        ? new Date(`${item.date}T${(item.endTime && timeRegex.test(item.endTime) ? item.endTime : item.startTime)}:00.000Z`)
        : new Date(item.date + 'T23:59:59.000Z');
      if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) { skipped++; continue; }

      const dayStart = new Date(item.date + 'T00:00:00.000Z');
      const dayEnd = new Date(item.date + 'T23:59:59.000Z');
      const existing = await this.prisma.event.findFirst({
        where: { familyId, title: item.title, startAt: { gte: dayStart, lte: dayEnd } },
      });

      if (existing) { skipped++; continue; }

      await this.prisma.event.create({
        data: {
          familyId,
          createdBy: userId,
          title: item.title,
          type: item.type as EventType,
          visibility: dto.visibility as EventVisibility,
          startAt,
          endAt,
          allDay: !hasTime,
          repeat: 'NONE',
          notes: item.notes ?? undefined,
          ...(dto.childIds.length > 0 && {
            children: { create: dto.childIds.map((childId) => ({ childId })) },
          }),
        },
      });
      created++;
    }

    return { created, skipped };
  }

  async extractFromImage(familyId: string, userId: string, file: Express.Multer.File) {
    await this.familyService.assertMember(familyId, userId);

    const base64 = file.buffer.toString('base64');
    const mediaType = file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

    const response = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `Extract all events and scheduled activities from this schedule image.
Return ONLY a raw JSON array — no markdown, no code blocks, no explanation.
Each object must have:
  "title": string
  "date": "YYYY-MM-DD"
  "startTime": "HH:MM" or null
  "endTime": "HH:MM" or null
  "type": one of SCHOOL | ACTIVITY | MEDICAL | VACATION | OTHER
  "notes": string or null
If the year is not shown, assume ${new Date().getFullYear()}.
Return [] if no events are found.`,
            },
          ],
        },
      ],
    });

    const raw = (response.content[0] as { text: string }).text.trim();
    const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      const events = JSON.parse(clean);
      return Array.isArray(events) ? events : [];
    } catch {
      return [];
    }
  }

  async remove(familyId: string, eventId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { title: true, startAt: true },
    });
    await this.prisma.event.delete({ where: { id: eventId, familyId } });

    void this.audit.log({
      familyId,
      actorId:      userId,
      action:       'EVENT_DELETED',
      affectedDate: event?.startAt,
      eventId,
      previousValue: event?.title,
    });

    return { message: 'Event deleted' };
  }
}
