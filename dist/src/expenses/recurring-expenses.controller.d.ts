import { RecurringExpensesService } from './recurring-expenses.service';
import { CreateRecurringExpenseDto, UpdateRecurringExpenseDto } from './dto/recurring-expense.dto';
export declare class RecurringExpensesController {
    private readonly service;
    constructor(service: RecurringExpensesService);
    create(user: {
        id: string;
    }, familyId: string, dto: CreateRecurringExpenseDto): Promise<{
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
    generateDue(user: {
        id: string;
    }, familyId: string): Promise<{
        generated: number;
    }>;
    update(user: {
        id: string;
    }, familyId: string, id: string, dto: UpdateRecurringExpenseDto): Promise<{
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
    remove(user: {
        id: string;
    }, familyId: string, id: string): Promise<void>;
}
