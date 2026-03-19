import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
export declare class ExpensesService {
    private prisma;
    private familyService;
    constructor(prisma: PrismaService, familyService: FamilyService);
    create(familyId: string, userId: string, dto: CreateExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        date: Date;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        description: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    findAll(familyId: string, userId: string): Promise<({
        payer: {
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
        date: Date;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        description: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    })[]>;
    findOne(familyId: string, expenseId: string, userId: string): Promise<{
        payer: {
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
        date: Date;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        description: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    update(familyId: string, expenseId: string, userId: string, dto: UpdateExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        date: Date;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        description: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    remove(familyId: string, expenseId: string, userId: string): Promise<{
        message: string;
    }>;
    settle(familyId: string, expenseId: string, userId: string): Promise<{
        payer: {
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
        date: Date;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        description: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    unsettle(familyId: string, expenseId: string, userId: string): Promise<{
        payer: {
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
        date: Date;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        description: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    settleAll(familyId: string, userId: string): Promise<{
        settled: number;
    }>;
    getBalance(familyId: string, userId: string): Promise<{
        members: {
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
            balance: number;
        }[];
        summary: {
            pendingCount: number;
            settledCount: number;
            totalSettled: number;
        };
    }>;
}
