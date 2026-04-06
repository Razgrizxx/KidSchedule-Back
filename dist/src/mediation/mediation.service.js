"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const claude_service_1 = require("../claude/claude.service");
const messaging_service_1 = require("../messaging/messaging.service");
const chat_gateway_1 = require("../messaging/chat.gateway");
const mail_service_1 = require("../mail/mail.service");
let MediationService = class MediationService {
    prisma;
    familyService;
    claude;
    messaging;
    chatGateway;
    mail;
    constructor(prisma, familyService, claude, messaging, chatGateway, mail) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.claude = claude;
        this.messaging = messaging;
        this.chatGateway = chatGateway;
        this.mail = mail;
    }
    async createSession(familyId, userId, dto) {
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
                }).catch(() => { });
            }
        })
            .catch(() => { });
        return session;
    }
    async getSessions(familyId, userId) {
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
    async getSession(familyId, sessionId, userId) {
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
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        return session;
    }
    async sendMessage(familyId, sessionId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const session = await this.prisma.mediationSession.findFirst({
            where: { id: sessionId, familyId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== 'ACTIVE')
            throw new common_1.BadRequestException('Session is no longer active');
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
    async askAI(familyId, sessionId, userId) {
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
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== 'ACTIVE')
            throw new common_1.BadRequestException('Session is no longer active');
        const history = session.messages.map((m) => ({
            role: (m.isAI ? 'assistant' : 'user'),
            content: m.isAI
                ? m.content
                : `${m.sender?.firstName ?? 'Parent'}: ${m.content}`,
        }));
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
        this.chatGateway.emitToFamily(familyId, 'new_mediation_message', {
            sessionId,
            message: aiMessage,
        });
        return aiMessage;
    }
    async proposeResolution(familyId, sessionId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const session = await this.prisma.mediationSession.findFirst({
            where: { id: sessionId, familyId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== 'ACTIVE')
            throw new common_1.BadRequestException('Session is no longer active');
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
    async respondProposal(familyId, sessionId, proposalId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const proposal = await this.prisma.resolutionProposal.findFirst({
            where: { id: proposalId, sessionId },
            include: {
                session: true,
                proposer: { select: { firstName: true, lastName: true } },
            },
        });
        if (!proposal)
            throw new common_1.NotFoundException('Proposal not found');
        if (proposal.status !== 'PENDING')
            throw new common_1.BadRequestException('Proposal already resolved');
        if (proposal.proposedBy === userId)
            throw new common_1.ForbiddenException('Cannot respond to your own proposal');
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
            await this.messaging.sendSystemMessage(familyId, `System: Mediation session "${proposal.session.topic}" has been RESOLVED. ` +
                `${responderName} accepted the proposed agreement: "${proposal.summary}"`);
            this.chatGateway.emitToFamily(familyId, 'notification', {
                type: 'MEDIATION_RESOLVED',
                payload: { sessionId, topic: proposal.session.topic },
            });
        }
        this.chatGateway.emitToFamily(familyId, 'new_mediation_proposal_response', {
            sessionId,
            proposalId,
            status: dto.action,
            sessionStatus: dto.action === 'ACCEPTED' ? 'RESOLVED' : undefined,
        });
        return updated;
    }
    async escalate(familyId, sessionId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const session = await this.prisma.mediationSession.findFirst({
            where: { id: sessionId, familyId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        const updated = await this.prisma.mediationSession.update({
            where: { id: sessionId },
            data: { status: 'ESCALATED' },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { firstName: true, lastName: true },
        });
        await this.messaging.sendSystemMessage(familyId, `System: Mediation session "${session.topic}" has been ESCALATED to professional mediation by ${user?.firstName ?? 'a parent'}.`);
        return updated;
    }
    async getCourtReport(familyId, sessionId, userId) {
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
        if (!session)
            throw new common_1.NotFoundException('Session not found');
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
    async getStats(familyId, userId) {
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
};
exports.MediationService = MediationService;
exports.MediationService = MediationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService,
        claude_service_1.ClaudeService,
        messaging_service_1.MessagingService,
        chat_gateway_1.ChatGateway,
        mail_service_1.MailService])
], MediationService);
//# sourceMappingURL=mediation.service.js.map