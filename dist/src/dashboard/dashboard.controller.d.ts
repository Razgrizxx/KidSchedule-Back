import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly service;
    constructor(service: DashboardService);
    getToday(user: {
        id: string;
    }, familyId: string): Promise<{
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
