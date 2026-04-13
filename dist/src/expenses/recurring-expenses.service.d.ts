import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringExpenseDto, UpdateRecurringExpenseDto } from './dto/recurring-expense.dto';
export declare class RecurringExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(familyId: string, userId: string, dto: CreateRecurringExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        createdBy: string;
        startDate: Date;
        isActive: boolean;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        frequency: import("@prisma/client").$Enums.RecurringFrequency;
        endDate: Date | null;
        lastGeneratedAt: Date | null;
    }>;
    findAll(familyId: string): Promise<({
        _count: {
            instances: number;
        };
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        createdBy: string;
        startDate: Date;
        isActive: boolean;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        frequency: import("@prisma/client").$Enums.RecurringFrequency;
        endDate: Date | null;
        lastGeneratedAt: Date | null;
    })[]>;
    update(familyId: string, id: string, userId: string, dto: UpdateRecurringExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        createdBy: string;
        startDate: Date;
        isActive: boolean;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        frequency: import("@prisma/client").$Enums.RecurringFrequency;
        endDate: Date | null;
        lastGeneratedAt: Date | null;
    }>;
    remove(familyId: string, id: string, userId: string): Promise<void>;
    generateDue(familyId: string, userId: string): Promise<{
        generated: number;
    }>;
}
