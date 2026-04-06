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
        familyId: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        id: string;
        topic: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSessions(user: AuthUser, familyId: string): Promise<({
        proposals: {
            status: import("@prisma/client").$Enums.ProposalStatus;
            id: string;
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
        familyId: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        id: string;
        topic: string;
        createdAt: Date;
        updatedAt: Date;
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
            status: import("@prisma/client").$Enums.ProposalStatus;
            id: string;
            createdAt: Date;
            sessionId: string;
            proposedBy: string;
            summary: string;
            acceptedBy: string | null;
        })[];
    } & {
        familyId: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        id: string;
        topic: string;
        createdAt: Date;
        updatedAt: Date;
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
        sessionId: string;
        senderId: string | null;
        content: string;
        isAI: boolean;
    }>;
    askAI(user: AuthUser, familyId: string, sessionId: string): Promise<{
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
    proposeResolution(user: AuthUser, familyId: string, sessionId: string, dto: ProposeResolutionDto): Promise<{
        proposer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        status: import("@prisma/client").$Enums.ProposalStatus;
        id: string;
        createdAt: Date;
        sessionId: string;
        proposedBy: string;
        summary: string;
        acceptedBy: string | null;
    }>;
    respondProposal(user: AuthUser, familyId: string, sessionId: string, proposalId: string, dto: RespondProposalDto): Promise<{
        status: import("@prisma/client").$Enums.ProposalStatus;
        id: string;
        createdAt: Date;
        sessionId: string;
        proposedBy: string;
        summary: string;
        acceptedBy: string | null;
    }>;
    escalate(user: AuthUser, familyId: string, sessionId: string): Promise<{
        familyId: string;
        status: import("@prisma/client").$Enums.MediationStatus;
        id: string;
        topic: string;
        createdAt: Date;
        updatedAt: Date;
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
                status: import("@prisma/client").$Enums.ProposalStatus;
                id: string;
                createdAt: Date;
                sessionId: string;
                proposedBy: string;
                summary: string;
                acceptedBy: string | null;
            })[];
        } & {
            familyId: string;
            status: import("@prisma/client").$Enums.MediationStatus;
            id: string;
            topic: string;
            createdAt: Date;
            updatedAt: Date;
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
    inviteMediator(user: AuthUser, familyId: string, sessionId: string, dto: InviteMediatorDto): Promise<{
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
    getInvites(user: AuthUser, familyId: string, sessionId: string): Promise<({
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
    revokeInvite(user: AuthUser, familyId: string, sessionId: string, inviteId: string): Promise<{
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
}
