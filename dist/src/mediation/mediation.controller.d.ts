import { MediationService } from './mediation.service';
import { CreateSessionDto, SendMessageDto, ProposeResolutionDto, RespondProposalDto, InviteMediatorDto } from './dto/mediation.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class MediationController {
    private mediationService;
    constructor(mediationService: MediationService);
    getStats(user: AuthUser, familyId: string): Promise<{
        total: number;
        active: number;
        resolved: number;
        escalated: number;
        resolutionRate: number;
    }>;
    createSession(user: AuthUser, familyId: string, dto: CreateSessionDto): Promise<{
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
    getSessions(user: AuthUser, familyId: string): Promise<({
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
    getSession(user: AuthUser, familyId: string, sessionId: string): Promise<{
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
    sendMessage(user: AuthUser, familyId: string, sessionId: string, dto: SendMessageDto): Promise<{
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
    askAI(user: AuthUser, familyId: string, sessionId: string): Promise<{
        sender: {
            id: string;
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
            fcmTokens: string[];
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
    proposeResolution(user: AuthUser, familyId: string, sessionId: string, dto: ProposeResolutionDto): Promise<{
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
    respondProposal(user: AuthUser, familyId: string, sessionId: string, proposalId: string, dto: RespondProposalDto): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ProposalStatus;
        sessionId: string;
        summary: string;
        proposedBy: string;
        acceptedBy: string | null;
    }>;
    escalate(user: AuthUser, familyId: string, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        topic: string;
    }>;
    getCourtReport(user: AuthUser, familyId: string, sessionId: string): Promise<{
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
    inviteMediator(user: AuthUser, familyId: string, sessionId: string, dto: InviteMediatorDto): Promise<{
        viewUrl: string;
        inviter: {
            firstName: string;
            lastName: string;
        };
        id: string;
        email: string;
        role: string;
        createdAt: Date;
        name: string;
        expiresAt: Date;
        token: string;
        invitedBy: string;
        sessionId: string;
        revokedAt: Date | null;
    }>;
    getInvites(user: AuthUser, familyId: string, sessionId: string): Promise<({
        inviter: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        email: string;
        role: string;
        createdAt: Date;
        name: string;
        expiresAt: Date;
        token: string;
        invitedBy: string;
        sessionId: string;
        revokedAt: Date | null;
    })[]>;
    revokeInvite(user: AuthUser, familyId: string, sessionId: string, inviteId: string): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
        name: string;
        expiresAt: Date;
        token: string;
        invitedBy: string;
        sessionId: string;
        revokedAt: Date | null;
    }>;
}
