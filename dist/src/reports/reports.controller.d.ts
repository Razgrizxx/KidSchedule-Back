import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generate(user: {
        id: string;
    }, familyId: string, dto: GenerateReportDto): Promise<{
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
