import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateEventDto) {
    await this.familyService.assertMember(familyId, userId);
    const { childIds, ...rest } = dto;
    return this.prisma.event.create({
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
      },
    });
  }

  async findAll(familyId: string, userId: string, month?: string) {
    await this.familyService.assertMember(familyId, userId);

    const where: Prisma.EventWhereInput = { familyId };

    if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      where.startAt = { gte: start, lt: end };
    }

    return this.prisma.event.findMany({
      where,
      orderBy: { startAt: 'asc' },
      include: {
        children: { include: { child: { select: { id: true, firstName: true, lastName: true, color: true } } } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(familyId: string, eventId: string, userId: string, dto: UpdateEventDto) {
    await this.familyService.assertMember(familyId, userId);
    const { childIds, startAt, endAt, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
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
  }

  async remove(familyId: string, eventId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    await this.prisma.event.delete({ where: { id: eventId, familyId } });
    return { message: 'Event deleted' };
  }
}
