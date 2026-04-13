import { Injectable } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface LogAuditDto {
  familyId:        string;
  actorId:         string;
  action:          AuditAction;
  childId?:        string;
  affectedDate?:   Date;
  previousValue?:  string;
  newValue?:       string;
  changeRequestId?: string;
  eventId?:        string;
  notes?:          string;
}

export interface AuditQueryParams {
  from?:    string;
  to?:      string;
  childId?: string;
  action?:  AuditAction;
  take?:    number;
  cursor?:  string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Write a single audit log entry. Fire-and-forget safe — never throws. */
  async log(dto: LogAuditDto): Promise<void> {
    try {
      await this.prisma.custodyAuditLog.create({ data: dto });
    } catch {
      // Audit must never break the main flow
    }
  }

  /** Query audit logs for a family with optional filters. */
  async findAll(familyId: string, params: AuditQueryParams = {}) {
    const { from, to, childId, action, take = 50, cursor } = params;

    const where = {
      familyId,
      ...(childId && { childId }),
      ...(action  && { action }),
      ...((from || to) && {
        createdAt: {
          ...(from && { gte: new Date(from + 'T00:00:00.000Z') }),
          ...(to   && { lte: new Date(to   + 'T23:59:59.999Z') }),
        },
      }),
    };

    const rows = await this.prisma.custodyAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        actor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        child: { select: { id: true, firstName: true, color: true } },
        changeRequest: { select: { id: true, type: true, status: true } },
      },
    });

    return {
      logs: rows,
      nextCursor: rows.length === take ? rows[rows.length - 1].id : null,
    };
  }
}
