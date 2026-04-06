import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { ClaudeService } from '../claude/claude.service';
import { MessagingService } from '../messaging/messaging.service';
import { ChatGateway } from '../messaging/chat.gateway';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { CreateSessionDto, SendMessageDto, ProposeResolutionDto, RespondProposalDto, InviteMediatorDto } from './dto/mediation.dto';
export declare class MediationService {
    private prisma;
    private familyService;
    private claude;
    private messaging;
    private chatGateway;
    private mail;
    private config;
    constructor(prisma: PrismaService, familyService: FamilyService, claude: ClaudeService, messaging: MessagingService, chatGateway: ChatGateway, mail: MailService, config: ConfigService);
    createSession(familyId: string, userId: string, dto: CreateSessionDto): Promise<{
        _count: {
            messages: number;
            proposals: number;
        };
    } & {
        id: string;
        topic: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
    }>;
    getSessions(familyId: string, userId: string): Promise<({
        proposals: {
            id: string;
            status: import("@prisma/client").$Enums.ProposalStatus;
            createdAt: Date;
            sessionId: string;
            proposedBy: string;
            summary: string;
            acceptedBy: string | null;
        }[];
        _count: {
            messages: number;
        };
    } & {
        id: string;
        topic: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
    })[]>;
    getSession(familyId: string, sessionId: string, userId: string): Promise<{
        messages: ({
            sender: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            sessionId: string;
            senderId: string | null;
            content: string;
            isAI: boolean;
        })[];
        proposals: ({
            proposer: {
                id: string;
                firstName: string;
                lastName: string;
            };
            accepter: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ProposalStatus;
            createdAt: Date;
            sessionId: string;
            proposedBy: string;
            summary: string;
            acceptedBy: string | null;
        })[];
    } & {
        id: string;
        topic: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
    }>;
    sendMessage(familyId: string, sessionId: string, userId: string, dto: SendMessageDto): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        sessionId: string;
        senderId: string | null;
        content: string;
        isAI: boolean;
    }>;
    askAI(familyId: string, sessionId: string, userId: string): Promise<{
        sender: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string | null;
            icalFeedToken: string | null;
            firstName: string;
            lastName: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            isVerified: boolean;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            googleRefreshToken: string | null;
            googleAccessToken: string | null;
            googleTokenExpiry: Date | null;
            googleCalendarId: string | null;
            outlookAccessToken: string | null;
            outlookRefreshToken: string | null;
            outlookTokenExpiry: Date | null;
            outlookCalendarId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        sessionId: string;
        senderId: string | null;
        content: string;
        isAI: boolean;
    }>;
    proposeResolution(familyId: string, sessionId: string, userId: string, dto: ProposeResolutionDto): Promise<{
        proposer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ProposalStatus;
        createdAt: Date;
        sessionId: string;
        proposedBy: string;
        summary: string;
        acceptedBy: string | null;
    }>;
    respondProposal(familyId: string, sessionId: string, proposalId: string, userId: string, dto: RespondProposalDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ProposalStatus;
        createdAt: Date;
        sessionId: string;
        proposedBy: string;
        summary: string;
        acceptedBy: string | null;
    }>;
    escalate(familyId: string, sessionId: string, userId: string): Promise<{
        id: string;
        topic: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
    }>;
    getCourtReport(familyId: string, sessionId: string, userId: string): Promise<{
        session: {
            messages: ({
                sender: {
                    id: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                sessionId: string;
                senderId: string | null;
                content: string;
                isAI: boolean;
            })[];
            proposals: ({
                proposer: {
                    id: string;
                    firstName: string;
                    lastName: string;
                };
                accepter: {
                    id: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: string;
                status: import("@prisma/client").$Enums.ProposalStatus;
                createdAt: Date;
                sessionId: string;
                proposedBy: string;
                summary: string;
                acceptedBy: string | null;
            })[];
        } & {
            id: string;
            topic: string;
            status: import("@prisma/client").$Enums.MediationStatus;
            createdAt: Date;
            updatedAt: Date;
            familyId: string;
        };
        chainMessages: {
            id: string;
            createdAt: Date;
            content: string;
            sender: {
                firstName: string;
                lastName: string;
            };
            contentHash: string;
            previousHash: string;
            isSystemMessage: boolean;
        }[];
        generatedAt: string;
    }>;
    getStats(familyId: string, userId: string): Promise<{
        total: number;
        active: number;
        resolved: number;
        escalated: number;
        resolutionRate: number;
    }>;
    inviteMediator(familyId: string, sessionId: string, userId: string, dto: InviteMediatorDto): Promise<{
        viewUrl: string;
        inviter: {
            firstName: string;
            lastName: string;
        };
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: string;
        sessionId: string;
        token: string;
        expiresAt: Date;
        revokedAt: Date | null;
        invitedBy: string;
    }>;
    getInvites(familyId: string, sessionId: string, userId: string): Promise<({
        inviter: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: string;
        sessionId: string;
        token: string;
        expiresAt: Date;
        revokedAt: Date | null;
        invitedBy: string;
    })[]>;
    revokeInvite(familyId: string, sessionId: string, inviteId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: string;
        sessionId: string;
        token: string;
        expiresAt: Date;
        revokedAt: Date | null;
        invitedBy: string;
    }>;
    getSessionByToken(token: string): Promise<{
        mediator: {
            name: string;
            role: string;
            email: string;
        };
        session: {
            messages: ({
                sender: {
                    id: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                sessionId: string;
                senderId: string | null;
                content: string;
                isAI: boolean;
            })[];
            proposals: ({
                proposer: {
                    id: string;
                    firstName: string;
                    lastName: string;
                };
                accepter: {
                    id: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: string;
                status: import("@prisma/client").$Enums.ProposalStatus;
                createdAt: Date;
                sessionId: string;
                proposedBy: string;
                summary: string;
                acceptedBy: string | null;
            })[];
        } & {
            id: string;
            topic: string;
            status: import("@prisma/client").$Enums.MediationStatus;
            createdAt: Date;
            updatedAt: Date;
            familyId: string;
        };
    }>;
}
