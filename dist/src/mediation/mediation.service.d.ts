import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { ClaudeService } from '../claude/claude.service';
import { MessagingService } from '../messaging/messaging.service';
import { ChatGateway } from '../messaging/chat.gateway';
import { CreateSessionDto, SendMessageDto, ProposeResolutionDto, RespondProposalDto } from './dto/mediation.dto';
export declare class MediationService {
    private prisma;
    private familyService;
    private claude;
    private messaging;
    private chatGateway;
    constructor(prisma: PrismaService, familyService: FamilyService, claude: ClaudeService, messaging: MessagingService, chatGateway: ChatGateway);
    createSession(familyId: string, userId: string, dto: CreateSessionDto): Promise<{
        _count: {
            messages: number;
            proposals: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        topic: string;
    }>;
    getSessions(familyId: string, userId: string): Promise<({
        _count: {
            messages: number;
        };
        proposals: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ProposalStatus;
            sessionId: string;
            summary: string;
            proposedBy: string;
            acceptedBy: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        topic: string;
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
            senderId: string | null;
            content: string;
            isAI: boolean;
            sessionId: string;
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
            createdAt: Date;
            status: import("@prisma/client").$Enums.ProposalStatus;
            sessionId: string;
            summary: string;
            proposedBy: string;
            acceptedBy: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        topic: string;
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
        senderId: string | null;
        content: string;
        isAI: boolean;
        sessionId: string;
    }>;
    askAI(familyId: string, sessionId: string, userId: string): Promise<{
        sender: {
            id: string;
            email: string;
            phone: string | null;
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
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        senderId: string | null;
        content: string;
        isAI: boolean;
        sessionId: string;
    }>;
    proposeResolution(familyId: string, sessionId: string, userId: string, dto: ProposeResolutionDto): Promise<{
        proposer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ProposalStatus;
        sessionId: string;
        summary: string;
        proposedBy: string;
        acceptedBy: string | null;
    }>;
    respondProposal(familyId: string, sessionId: string, proposalId: string, userId: string, dto: RespondProposalDto): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ProposalStatus;
        sessionId: string;
        summary: string;
        proposedBy: string;
        acceptedBy: string | null;
    }>;
    escalate(familyId: string, sessionId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        topic: string;
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
                senderId: string | null;
                content: string;
                isAI: boolean;
                sessionId: string;
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
                createdAt: Date;
                status: import("@prisma/client").$Enums.ProposalStatus;
                sessionId: string;
                summary: string;
                proposedBy: string;
                acceptedBy: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            familyId: string;
            status: import("@prisma/client").$Enums.MediationStatus;
            topic: string;
        };
        chainMessages: {
            id: string;
            createdAt: Date;
            content: string;
            contentHash: string;
            previousHash: string;
            isSystemMessage: boolean;
            sender: {
                firstName: string;
                lastName: string;
            };
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
}
