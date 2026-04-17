import type { Request, Response } from 'express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class ExpensesController {
    private expensesService;
    constructor(expensesService: ExpensesService);
    uploadReceipt(file: Express.Multer.File, req: Request): {
        url: string;
    };
    settleAll(user: AuthUser, familyId: string): Promise<{
        settled: number;
    }>;
    create(user: AuthUser, familyId: string, dto: CreateExpenseDto): Promise<{
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
        recurringId: string | null;
    }>;
    findAll(user: AuthUser, familyId: string): Promise<({
        payer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
        recurringId: string | null;
    })[]>;
    exportCsv(user: AuthUser, familyId: string, from: string | undefined, to: string | undefined, res: Response): Promise<void>;
    getBalance(user: AuthUser, familyId: string): Promise<{
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
    findOne(user: AuthUser, familyId: string, expenseId: string): Promise<{
        payer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
        recurringId: string | null;
    }>;
    update(user: AuthUser, familyId: string, expenseId: string, dto: UpdateExpenseDto): Promise<{
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
        recurringId: string | null;
    }>;
    settle(user: AuthUser, familyId: string, expenseId: string): Promise<{
        payer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
        recurringId: string | null;
    }>;
    unsettle(user: AuthUser, familyId: string, expenseId: string): Promise<{
        payer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
        recurringId: string | null;
    }>;
    remove(user: AuthUser, familyId: string, expenseId: string): Promise<{
        message: string;
    }>;
}
