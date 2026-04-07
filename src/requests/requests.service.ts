import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { MessagingService } from '../messaging/messaging.service';
import { ChatGateway } from '../messaging/chat.gateway';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
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
    private chatGateway: ChatGateway,
    private mail: MailService,
    private notifications: NotificationsService,
    private audit: AuditService,
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

    // Audit log (fire-and-forget)
    void this.audit.log({
      familyId,
      actorId:         requesterId,
      action:          'REQUEST_CREATED',
      childId:         dto.childId ?? undefined,
      affectedDate:    new Date(dto.requestedDate),
      changeRequestId: created.id,
      notes:           dto.reason ?? undefined,
    });

    // Notify the co-parent by email (fire-and-forget)
    void this.notifyCoParentByEmail(familyId, created.requester.id, {
      requesterName,
      type: dto.type,
      requestedDate: new Date(dto.requestedDate).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric',
      }),
    }).catch(() => {});

    // Push notification to co-parent (fire-and-forget)
    const reqDateStr = new Date(dto.requestedDate).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short',
    });
    void this.notifications.sendToFamily(familyId, created.requester.id, {
      title: `${requesterName} envió una solicitud`,
      body: `Cambio de custodia para el ${reqDateStr}`,
      data: { type: 'REQUEST', familyId, requestId: created.id },
    }).catch(() => {});

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

    // Emit live notification to both parents
    this.chatGateway.emitToFamily(familyId, 'notification', {
      type: 'REQUEST_UPDATED',
      payload: { requestId, status: dto.action },
    });

    // Audit log (fire-and-forget)
    const auditAction =
      dto.action === 'ACCEPTED'         ? 'REQUEST_ACCEPTED' as const :
      dto.action === 'DECLINED'         ? 'REQUEST_DECLINED' as const :
      dto.action === 'COUNTER_PROPOSED' ? 'REQUEST_COUNTER'  as const :
      null;
    if (auditAction) {
      void this.audit.log({
        familyId,
        actorId:         responderId,
        action:          auditAction,
        childId:         request.childId ?? undefined,
        affectedDate:    request.requestedDate,
        changeRequestId: requestId,
        notes:           dto.counterReason ?? undefined,
      });
    }

    return updated;
  }

  private async notifyCoParentByEmail(
    familyId: string,
    requesterId: string,
    opts: { requesterName: string; type: string; requestedDate: string },
  ): Promise<void> {
    const memberships = await this.prisma.familyMember.findMany({
      where: { familyId, userId: { not: requesterId } },
      include: { user: { select: { email: true } } },
    });
    for (const m of memberships) {
      void this.mail.sendChangeRequestNotification({
        toEmail: m.user.email,
        requesterName: opts.requesterName,
        type: opts.type,
        requestedDate: opts.requestedDate,
      });
    }
  }

  /** Create CustodyEvent overrides when a request is approved */
  private async applyCalendarOverrides(
    request: {
      familyId: string;
      requesterId: string;
      childId: string | null;
      originalDate: Date | null;
      requestedDate: Date;
      requestedDateTo: Date | null;
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

    // Expand requestedDate range into individual days
    const requestedDates: Date[] = [];
    const endDate = request.requestedDateTo ?? request.requestedDate;
    const cur = new Date(request.requestedDate);
    while (cur <= endDate) {
      requestedDates.push(new Date(cur));
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    // Build overrides: all days in requested range → requester, originalDate swap → responder
    const overrides: [Date, string][] = [
      ...requestedDates.map((d) => [d, request.requesterId] as [Date, string]),
      ...(request.originalDate ? [[request.originalDate, responderId] as [Date, string]] : []),
    ];

    for (const [date, custodianId] of overrides) {
      // Read the current custodian before overriding (for audit previousValue)
      const existing = await this.prisma.custodyEvent.findUnique({
        where: { scheduleId_date: { scheduleId: schedule.id, date } },
        include: { child: { select: { firstName: true } } },
      });

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

      void this.audit.log({
        familyId:        request.familyId,
        actorId:         responderId,
        action:          'CUSTODY_OVERRIDE',
        childId:         schedule.childId,
        affectedDate:    date,
        previousValue:   existing?.custodianId ?? undefined,
        newValue:        custodianId,
        changeRequestId: undefined,
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
