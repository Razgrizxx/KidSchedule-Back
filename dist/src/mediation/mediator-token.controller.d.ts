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
                sessionId: string;
                createdAt: Date;
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
                sessionId: string;
                createdAt: Date;
                status: import("@prisma/client").$Enums.ProposalStatus;
                proposedBy: string;
                summary: string;
                acceptedBy: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            familyId: string;
            topic: string;
            status: import("@prisma/client").$Enums.MediationStatus;
        };
    }>;
}
