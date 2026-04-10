import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { GenerateReportDto } from './dto/report.dto';
export declare class ReportsService {
    private readonly prisma;
    private readonly familyService;
    private readonly anthropic;
    constructor(prisma: PrismaService, familyService: FamilyService);
    generate(familyId: string, userId: string, dto: GenerateReportDto): Promise<{
        markdown: string;
        period: {
            from: string;
            to: string;
        };
        generatedAt: string;
        stats: {
            events: number;
            expenses: number;
            expensesTotal: number;
            messages: number;
            custodyDays: number;
            healthRecords: number;
        };
    }>;
}
