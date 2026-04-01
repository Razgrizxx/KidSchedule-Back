import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType, EventVisibility, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { BulkImportDto, CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { getHolidaysForYear } from './holidays.data';
import type { CalendarEventUpsertPayload } from '../google/google-calendar-sync.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private eventEmitter: EventEmitter2,
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

    for (const item of dto.events) {
      const startAt = new Date(item.date + 'T00:00:00.000Z');
      const endAt = new Date(item.date + 'T23:59:59.000Z');

      const existing = await this.prisma.event.findFirst({
        where: { familyId, title: item.title, startAt: { gte: startAt, lte: endAt } },
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
          allDay: true,
          repeat: 'NONE',
          ...(dto.childIds.length > 0 && {
            children: { create: dto.childIds.map((childId) => ({ childId })) },
          }),
        },
      });
      created++;
    }

    return { created, skipped };
  }

  async remove(familyId: string, eventId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    await this.prisma.event.delete({ where: { id: eventId, familyId } });
    return { message: 'Event deleted' };
  }
}
