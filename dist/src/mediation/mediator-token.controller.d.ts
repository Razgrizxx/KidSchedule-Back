import { MediationService } from './mediation.service';
export declare class MediatorTokenController {
    private mediationService;
    constructor(mediationService: MediationService);
    getByToken(token: string): Promise<{
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
                summary: string;
                sessionId: string;
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
    }>;
}
