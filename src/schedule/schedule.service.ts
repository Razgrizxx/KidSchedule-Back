import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { ScheduleGeneratorService } from './schedule-generator.service';
import { CreateScheduleDto } from './dto/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private generator: ScheduleGeneratorService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateScheduleDto) {
    await this.familyService.assertMember(familyId, userId);

    const child = await this.prisma.child.findFirst({
      where: { id: dto.childId, familyId },
    });
    if (!child) throw new NotFoundException('Child not found in this family');

    const parent1Id = dto.parent1Id ?? userId;
    const parent2Id = dto.parent2Id;
    if (!parent2Id) throw new BadRequestException('parent2Id is required');

    // Load family settings for transition defaults
    const familySettings = await this.prisma.familySettings.findUnique({
      where: { familyId },
    });

    const WEEKDAY: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const exchangeDay =
      dto.exchangeDay ??
      (familySettings?.transitionDay != null
        ? (WEEKDAY[familySettings.transitionDay] ?? undefined)
        : undefined);

    const exchangeTime =
      dto.exchangeTime ?? familySettings?.transitionTime ?? undefined;

    // Deactivate existing schedules for this child
    await this.prisma.schedule.updateMany({
      where: { childId: dto.childId, familyId, isActive: true },
      data: { isActive: false },
    });

    const durationDays = dto.durationDays ?? 365;

    const schedule = await this.prisma.schedule.create({
      data: {
        familyId,
        childId: dto.childId,
        name: dto.name,
        pattern: dto.pattern,
        startDate: new Date(dto.startDate),
        durationDays,
        exchangeDay,
        exchangeTime,
        parent1Id,
        parent2Id,
      },
    });

    // Generate custody events
    const assignments = this.generator.generate(
      dto.pattern,
      new Date(dto.startDate),
      durationDays,
      parent1Id,
      parent2Id,
    );

    // Batch insert custody events (chunked for large sets)
    const chunkSize = 100;
    for (let i = 0; i < assignments.length; i += chunkSize) {
      const chunk = assignments.slice(i, i + chunkSize);
      await this.prisma.custodyEvent.createMany({
        data: chunk.map((a) => ({
          scheduleId: schedule.id,
          childId: dto.childId,
          familyId,
          date: a.date,
          custodianId: a.custodianId,
        })),
        skipDuplicates: true,
      });
    }

    return { schedule, eventsGenerated: assignments.length };
  }

  async findAll(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.schedule.findMany({
      where: { familyId },
      include: { child: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCalendar(
    familyId: string,
    userId: string,
    year: number,
    month: number,
  ) {
    await this.familyService.assertMember(familyId, userId);

    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0); // last day of month

    const events = await this.prisma.custodyEvent.findMany({
      where: {
        familyId,
        date: { gte: from, lte: to },
      },
      include: {
        child: { select: { id: true, firstName: true, color: true } },
      },
      orderBy: { date: 'asc' },
    });

    return events;
  }

  async overrideDay(
    familyId: string,
    scheduleId: string,
    date: string,
    custodianId: string,
    userId: string,
  ) {
    await this.familyService.assertMember(familyId, userId);

    const dayDate = new Date(date);

    return this.prisma.custodyEvent.upsert({
      where: { scheduleId_date: { scheduleId, date: dayDate } },
      update: { custodianId, isOverride: true },
      create: {
        scheduleId,
        childId: (await this.prisma.schedule.findUnique({
          where: { id: scheduleId },
        }))!.childId,
        familyId,
        date: dayDate,
        custodianId,
        isOverride: true,
      },
    });
  }
}
