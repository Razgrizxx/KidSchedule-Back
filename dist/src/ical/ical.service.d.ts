import { PrismaService } from '../prisma/prisma.service';
export declare class IcalService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOrCreateFeedToken(userId: string): Promise<string>;
    rotateFeedToken(userId: string): Promise<string>;
    generateFeed(token: string): Promise<string>;
    private groupCustodyBlocks;
    private buildCalendar;
    private toIcalStamp;
    private toIcalDate;
    private escape;
}
