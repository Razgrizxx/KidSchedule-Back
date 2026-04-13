import type { CustodyBlocksUpdatedPayload } from '../schedule/schedule.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthService } from './google-auth.service';
import { ChatGateway } from '../messaging/chat.gateway';
export interface CalendarEventUpsertPayload {
    eventId: string;
    userId: string;
}
export interface CalendarEventDeletePayload {
    eventId: string;
    userId: string;
    familyId: string;
    googleEventId: string | null;
    outlookEventId: string | null;
}
export declare class GoogleCalendarSyncService {
    private readonly prisma;
    private readonly config;
    private readonly googleAuth;
    private readonly chatGateway;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService, googleAuth: GoogleAuthService, chatGateway: ChatGateway);
    handleEventUpsert(payload: CalendarEventUpsertPayload): Promise<void>;
    handleEventDeleted(payload: CalendarEventDeletePayload): Promise<void>;
    handleCustodyBlocksUpdated(payload: CustodyBlocksUpdatedPayload): Promise<void>;
    syncAllEvents(familyId: string, userId: string, cleanup?: boolean): Promise<{
        synced: number;
        custodySynced: number;
    }>;
    private getOrCreateKidScheduleCalendar;
    private buildChildColorMap;
    private syncRegularEvents;
    private syncCustodyBlocks;
    private groupCustodyBlocks;
    private upsertGoogleEvent;
    private deleteGoogleEventsBatch;
    private getRefreshedClient;
    private mapToGoogleEvent;
    private mapCustodyBlockToGoogleEvent;
}
