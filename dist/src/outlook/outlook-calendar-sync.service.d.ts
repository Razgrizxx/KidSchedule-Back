import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OutlookAuthService } from './outlook-auth.service';
import type { CalendarEventUpsertPayload } from '../google/google-calendar-sync.service';
export declare class OutlookCalendarSyncService {
    private readonly prisma;
    private readonly config;
    private readonly outlookAuth;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService, outlookAuth: OutlookAuthService);
    handleEventUpsert(payload: CalendarEventUpsertPayload): Promise<void>;
    syncAllEvents(familyId: string, userId: string, cleanup?: boolean): Promise<{
        synced: number;
        custodySynced: number;
    }>;
    private getOrCreateKidScheduleCalendar;
    private syncRegularEvents;
    private syncCustodyBlocks;
    private groupCustodyBlocks;
    private upsertOutlookEvent;
    private deleteOutlookEventsBatch;
    private mapToOutlookEvent;
    private mapCustodyBlockToOutlookEvent;
    private toOutlookDate;
}
