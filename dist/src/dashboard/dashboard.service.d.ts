import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getToday(familyId: string, userId: string): Promise<{
        date: string;
        custodyToday: {
            childId: string;
            childName: string;
            childColor: string;
            custodianId: string;
            custodianName: string;
            isMyDay: boolean;
        }[];
        eventsToday: {
            id: string;
            title: string;
            type: import("@prisma/client").$Enums.EventType;
            startAt: Date;
            allDay: boolean;
            assignedTo: {
                id: string;
                firstName: string;
            } | null;
        }[];
        eventsNext48h: {
            id: string;
            title: string;
            type: import("@prisma/client").$Enums.EventType;
            startAt: Date;
            allDay: boolean;
        }[];
        pendingRequests: {
            total: number;
            incomingForMe: number;
        };
        unreadMessages: number;
        nextHandoff: {
            handoffAt: Date;
            childName: string;
            childColor: string;
            fromParent: string;
            toParent: string;
            isReceiving: boolean;
            confirmedAt: Date | null;
        } | null;
    }>;
}
