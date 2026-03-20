import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { MessagingService } from '../messaging/messaging.service';
import {
  CreateChangeRequestDto,
  RespondChangeRequestDto,
} from './dto/change-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private messaging: MessagingService,
  ) {}

  async create(
    familyId: string,
    requesterId: string,
    dto: CreateChangeRequestDto,
  ) {
    await this.familyService.assertMember(familyId, requesterId);

    const created = await this.prisma.changeRequest.create({
      data: {
        familyId,
        requesterId,
        type: dto.type,
        originalDate: dto.originalDate ? new Date(dto.originalDate) : undefined,
        requestedDate: new Date(dto.requestedDate),
        requestedDateTo: dto.requestedDateTo ? new Date(dto.requestedDateTo) : undefined,
        childId: dto.childId,
        reason: dto.reason,
      },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const requesterName = `${created.requester.firstName} ${created.requester.lastName}`;
    const reqFmt = new Date(dto.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const msg = dto.originalDate
      ? (() => {
          const origFmt = new Date(dto.originalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return `System: ${requesterName} has requested a custody swap — giving up ${origFmt} in exchange for ${reqFmt}.`;
        })()
      : dto.requestedDateTo
        ? (() => {
            const toFmt = new Date(dto.requestedDateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `System: ${requesterName} has requested extra days from ${reqFmt} to ${toFmt}.`;
          })()
        : `System: ${requesterName} has requested an extra day on ${reqFmt}.`;
    await this.messaging.sendSystemMessage(familyId, msg);

    return created;
  }

  async findAll(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);

    return this.prisma.changeRequest.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true } },
        responder: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async respond(
    familyId: string,
    requestId: string,
    responderId: string,
    dto: RespondChangeRequestDto,
  ) {
    await this.familyService.assertMember(familyId, responderId);

    const request = await this.prisma.changeRequest.findFirst({
      where: { id: requestId, familyId },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true } },
        responder: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!request) throw new NotFoundException('Change request not found');
    if (request.status !== 'PENDING')
      throw new BadRequestException('Request already resolved');
    if (request.requesterId === responderId)
      throw new ForbiddenException('Cannot respond to your own request');

    if (dto.action === 'COUNTER_PROPOSED' && !dto.counterDate)
      throw new BadRequestException('counterDate is required for counter proposals');

    const updated = await this.prisma.changeRequest.update({
      where: { id: requestId },
      data: {
        status: dto.action,
        responderId,
        counterDate: dto.counterDate ? new Date(dto.counterDate) : undefined,
        counterReason: dto.counterReason,
        resolvedAt: dto.action !== 'COUNTER_PROPOSED' ? new Date() : undefined,
      },
    });

    // Apply calendar overrides when accepted
    if (dto.action === 'ACCEPTED') {
      await this.applyCalendarOverrides(request, responderId);
    }

    // Send system message for all actions
    await this.sendStatusMessage(familyId, request, dto.action, responderId);

    return updated;
  }

  /** Create CustodyEvent overrides when a request is approved */
  private async applyCalendarOverrides(
    request: {
      familyId: string;
      requesterId: string;
      childId: string | null;
      originalDate: Date | null;
      requestedDate: Date;
    },
    responderId: string,
  ) {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        familyId: request.familyId,
        ...(request.childId ? { childId: request.childId } : {}),
        isActive: true,
      },
    });

    if (schedules.length === 0) return;
    const schedule = schedules[0];

    // Build the list of overrides to apply:
    // - requestedDate → requester (always)
    // - originalDate → responder (only when this is a swap)
    const overrides: [Date, string][] = [
      [request.requestedDate, request.requesterId],
      ...(request.originalDate ? [[request.originalDate, responderId] as [Date, string]] : []),
    ];

    for (const [date, custodianId] of overrides) {
      await this.prisma.custodyEvent.upsert({
        where: { scheduleId_date: { scheduleId: schedule.id, date } },
        update: { custodianId, isOverride: true },
        create: {
          scheduleId: schedule.id,
          childId: schedule.childId,
          familyId: request.familyId,
          date,
          custodianId,
          isOverride: true,
        },
      });
    }
  }

  private async sendStatusMessage(
    familyId: string,
    request: {
      requester: { firstName: string; lastName: string };
      originalDate: Date | null;
      requestedDate: Date;
    },
    action: string,
    responderId: string,
  ) {
    const responder = await this.prisma.user.findUnique({
      where: { id: responderId },
      select: { firstName: true, lastName: true },
    });
    const responderName = responder ? `${responder.firstName} ${responder.lastName}` : 'Co-parent';
    const requesterName = `${request.requester.firstName} ${request.requester.lastName}`;
    const reqFmt = request.requestedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isSwap = !!request.originalDate;
    const origFmt = isSwap
      ? request.originalDate!.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;

    const messages: Record<string, string> = {
      ACCEPTED: isSwap
        ? `System: ${responderName} has APPROVED the custody swap requested by ${requesterName} (${origFmt} ↔ ${reqFmt}). Calendar updated.`
        : `System: ${responderName} has APPROVED ${requesterName}'s request for an extra day on ${reqFmt}. Calendar updated.`,
      DECLINED: isSwap
        ? `System: ${responderName} has DECLINED the custody swap requested by ${requesterName} (${origFmt} ↔ ${reqFmt}).`
        : `System: ${responderName} has DECLINED ${requesterName}'s request for ${reqFmt}.`,
      COUNTER_PROPOSED: `System: ${responderName} has sent a COUNTER-PROPOSAL to ${requesterName}'s request for ${reqFmt}.`,
    };

    const msg = messages[action];
    if (msg) await this.messaging.sendSystemMessage(familyId, msg);
  }
}
