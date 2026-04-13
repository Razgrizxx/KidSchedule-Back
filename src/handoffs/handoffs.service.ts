import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { AuditService } from '../audit/audit.service';
import { CreateHandoffDto } from './dto/handoff.dto';

const INCLUDE = {
  child:      { select: { id: true, firstName: true, color: true } },
  fromParent: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
  toParent:   { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
} as const;

@Injectable()
export class HandoffsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly familyService: FamilyService,
    private readonly audit: AuditService,
  ) {}

  async create(familyId: string, actorId: string, dto: CreateHandoffDto) {
    await this.familyService.assertMember(familyId, actorId);

    const handoff = await this.prisma.handoffLog.create({
      data: {
        familyId,
        childId:      dto.childId,
        handoffAt:    new Date(dto.handoffAt),
        fromParentId: actorId,
        toParentId:   dto.toParentId,
        location:     dto.location,
        notes:        dto.notes,
      },
      include: INCLUDE,
    });

    void this.audit.log({
      familyId,
      actorId,
      action:       'EVENT_CREATED', // reuse closest action — no HANDOFF_LOGGED yet
      childId:      dto.childId,
      affectedDate: new Date(dto.handoffAt),
      notes:        `Handoff registrado → ${handoff.toParent.firstName} ${handoff.toParent.lastName}`,
    });

    return handoff;
  }

  async findAll(
    familyId: string,
    userId: string,
    opts: { childId?: string; from?: string; to?: string; take?: number; cursor?: string },
  ) {
    await this.familyService.assertMember(familyId, userId);

    const { childId, from, to, take = 30, cursor } = opts;

    const rows = await this.prisma.handoffLog.findMany({
      where: {
        familyId,
        ...(childId && { childId }),
        ...((from || to) && {
          handoffAt: {
            ...(from && { gte: new Date(from + 'T00:00:00.000Z') }),
            ...(to   && { lte: new Date(to   + 'T23:59:59.999Z') }),
          },
        }),
      },
      orderBy: { handoffAt: 'desc' },
      take,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: INCLUDE,
    });

    return {
      handoffs:   rows,
      nextCursor: rows.length === take ? rows[rows.length - 1].id : null,
    };
  }

  async confirm(familyId: string, handoffId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);

    const handoff = await this.prisma.handoffLog.findFirst({
      where: { id: handoffId, familyId },
    });

    if (!handoff) throw new NotFoundException('Handoff not found');
    if (handoff.toParentId !== userId) {
      throw new ForbiddenException('Only the receiving parent can confirm this handoff');
    }
    if (handoff.confirmedBy) {
      throw new ForbiddenException('Handoff already confirmed');
    }

    return this.prisma.handoffLog.update({
      where: { id: handoffId },
      data:  { confirmedBy: userId, confirmedAt: new Date() },
      include: INCLUDE,
    });
  }

  async remove(familyId: string, handoffId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);

    const handoff = await this.prisma.handoffLog.findFirst({
      where: { id: handoffId, familyId },
    });

    if (!handoff) throw new NotFoundException('Handoff not found');
    if (handoff.fromParentId !== userId) {
      throw new ForbiddenException('Only the parent who logged this handoff can delete it');
    }
    if (handoff.confirmedBy) {
      throw new ForbiddenException('Cannot delete a confirmed handoff');
    }

    await this.prisma.handoffLog.delete({ where: { id: handoffId } });
    return { message: 'Handoff deleted' };
  }
}
