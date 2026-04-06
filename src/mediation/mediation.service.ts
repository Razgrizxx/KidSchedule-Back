import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { ClaudeService } from '../claude/claude.service';
import { MessagingService } from '../messaging/messaging.service';
import { ChatGateway } from '../messaging/chat.gateway';
import { MailService } from '../mail/mail.service';
import {
  CreateSessionDto,
  SendMessageDto,
  ProposeResolutionDto,
  RespondProposalDto,
} from './dto/mediation.dto';

@Injectable()
export class MediationService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private claude: ClaudeService,
    private messaging: MessagingService,
    private chatGateway: ChatGateway,
    private mail: MailService,
  ) {}

  async createSession(familyId: string, userId: string, dto: CreateSessionDto) {
    await this.familyService.assertMember(familyId, userId);

    const [session, initiator] = await Promise.all([
      this.prisma.mediationSession.create({
        data: { familyId, topic: dto.topic },
        include: { _count: { select: { messages: true, proposals: true } } },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      }),
    ]);

    // Notify co-parents by email (fire-and-forget)
    const initiatorName = initiator
      ? `${initiator.firstName} ${initiator.lastName}`
      : 'Tu co-padre/madre';

    void this.prisma.familyMember
      .findMany({
        where: { familyId, userId: { not: userId } },
        include: { user: { select: { email: true, firstName: true } } },
      })
      .then((memberships) => {
        for (const m of memberships) {
          void this.mail.sendMediationAlert({
            toEmail: m.user.email,
            recipientName: m.user.firstName,
            initiatorName,
            topic: dto.topic,
          }).catch(() => {});
        }
      })
      .catch(() => {});

    return session;
  }

  async getSessions(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.mediationSession.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
        proposals: { where: { status: 'PENDING' }, take: 1 },
      },
    });
  }

  async getSession(familyId: string, sessionId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const session = await this.prisma.mediationSession.findFirst({
      where: { id: sessionId, familyId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        proposals: {
          orderBy: { createdAt: 'desc' },
          include: {
            proposer: { select: { id: true, firstName: true, lastName: true } },
            accepter: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async sendMessage(
    familyId: string,
    sessionId: string,
    userId: string,
    dto: SendMessageDto,
  ) {
    await this.familyService.assertMember(familyId, userId);
    const session = await this.prisma.mediationSession.findFirst({
      where: { id: sessionId, familyId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'ACTIVE')
      throw new BadRequestException('Session is no longer active');

    const message = await this.prisma.mediationMessage.create({
      data: { sessionId, senderId: userId, content: dto.content, isAI: false },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    this.chatGateway.emitToFamily(familyId, 'new_mediation_message', {
      sessionId,
      message,
    });

    return message;
  }

  async askAI(familyId: string, sessionId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const session = await this.prisma.mediationSession.findFirst({
      where: { id: sessionId, familyId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'ACTIVE')
      throw new BadRequestException('Session is no longer active');

    // Build conversation history for Claude
    const history = session.messages.map((m) => ({
      role: (m.isAI ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.isAI
        ? m.content
        : `${m.sender?.firstName ?? 'Parent'}: ${m.content}`,
    }));

    // Claude needs at least one user message
    if (!history.some((h) => h.role === 'user')) {
      history.push({
        role: 'user',
        content: 'Please provide an initial mediation assessment for this session.',
      });
    }

    const aiResponse = await this.claude.getMediationAdvice(history);

    const aiMessage = await this.prisma.mediationMessage.create({
      data: { sessionId, senderId: null, content: aiResponse, isAI: true },
      include: { sender: true },
    });

    // Push AI message in real-time to both parents
    this.chatGateway.emitToFamily(familyId, 'new_mediation_message', {
      sessionId,
      message: aiMessage,
    });

    return aiMessage;
  }

  async proposeResolution(
    familyId: string,
    sessionId: string,
    userId: string,
    dto: ProposeResolutionDto,
  ) {
    await this.familyService.assertMember(familyId, userId);
    const session = await this.prisma.mediationSession.findFirst({
      where: { id: sessionId, familyId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'ACTIVE')
      throw new BadRequestException('Session is no longer active');

    // Cancel any existing pending proposals first
    await this.prisma.resolutionProposal.updateMany({
      where: { sessionId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });

    const proposal = await this.prisma.resolutionProposal.create({
      data: { sessionId, proposedBy: userId, summary: dto.summary },
      include: {
        proposer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    this.chatGateway.emitToFamily(familyId, 'new_mediation_proposal', {
      sessionId,
      proposal,
    });

    return proposal;
  }

  async respondProposal(
    familyId: string,
    sessionId: string,
    proposalId: string,
    userId: string,
    dto: RespondProposalDto,
  ) {
    await this.familyService.assertMember(familyId, userId);
    const proposal = await this.prisma.resolutionProposal.findFirst({
      where: { id: proposalId, sessionId },
      include: {
        session: true,
        proposer: { select: { firstName: true, lastName: true } },
      },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status !== 'PENDING')
      throw new BadRequestException('Proposal already resolved');
    if (proposal.proposedBy === userId)
      throw new ForbiddenException('Cannot respond to your own proposal');

    const updated = await this.prisma.resolutionProposal.update({
      where: { id: proposalId },
      data: {
        status: dto.action,
        acceptedBy: dto.action === 'ACCEPTED' ? userId : undefined,
      },
    });

    if (dto.action === 'ACCEPTED') {
      await this.prisma.mediationSession.update({
        where: { id: sessionId },
        data: { status: 'RESOLVED' },
      });

      const responder = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });
      const responderName = responder
        ? `${responder.firstName} ${responder.lastName}`
        : 'Co-parent';

      await this.messaging.sendSystemMessage(
        familyId,
        `System: Mediation session "${proposal.session.topic}" has been RESOLVED. ` +
          `${responderName} accepted the proposed agreement: "${proposal.summary}"`,
      );

      // Notify both parents in real-time
      this.chatGateway.emitToFamily(familyId, 'notification', {
        type: 'MEDIATION_RESOLVED',
        payload: { sessionId, topic: proposal.session.topic },
      });
    }

    // Always notify both parents of the proposal response
    this.chatGateway.emitToFamily(familyId, 'new_mediation_proposal_response', {
      sessionId,
      proposalId,
      status: dto.action,
      sessionStatus: dto.action === 'ACCEPTED' ? 'RESOLVED' : undefined,
    });

    return updated;
  }

  async escalate(familyId: string, sessionId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const session = await this.prisma.mediationSession.findFirst({
      where: { id: sessionId, familyId },
    });
    if (!session) throw new NotFoundException('Session not found');

    const updated = await this.prisma.mediationSession.update({
      where: { id: sessionId },
      data: { status: 'ESCALATED' },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    await this.messaging.sendSystemMessage(
      familyId,
      `System: Mediation session "${session.topic}" has been ESCALATED to professional mediation by ${user?.firstName ?? 'a parent'}.`,
    );

    return updated;
  }

  async getCourtReport(familyId: string, sessionId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const session = await this.prisma.mediationSession.findFirst({
      where: { id: sessionId, familyId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        proposals: {
          orderBy: { createdAt: 'asc' },
          include: {
            proposer: { select: { id: true, firstName: true, lastName: true } },
            accepter: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    // Include family messaging hash chain for legal validity
    const chainMessages = await this.prisma.message.findMany({
      where: { familyId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        contentHash: true,
        previousHash: true,
        createdAt: true,
        isSystemMessage: true,
        sender: { select: { firstName: true, lastName: true } },
      },
    });

    return { session, chainMessages, generatedAt: new Date().toISOString() };
  }

  async getStats(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const [total, active, resolved, escalated] = await Promise.all([
      this.prisma.mediationSession.count({ where: { familyId } }),
      this.prisma.mediationSession.count({ where: { familyId, status: 'ACTIVE' } }),
      this.prisma.mediationSession.count({ where: { familyId, status: 'RESOLVED' } }),
      this.prisma.mediationSession.count({ where: { familyId, status: 'ESCALATED' } }),
    ]);
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, active, resolved, escalated, resolutionRate };
  }
}
