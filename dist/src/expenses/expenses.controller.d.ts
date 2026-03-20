import type { Request } from 'express';
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        date: Date;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    findAll(user: AuthUser, familyId: string): Promise<({
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
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    })[]>;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        date: Date;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    update(user: AuthUser, familyId: string, expenseId: string, dto: UpdateExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        date: Date;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    settle(user: AuthUser, familyId: string, expenseId: string): Promise<{
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
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    unsettle(user: AuthUser, familyId: string, expenseId: string): Promise<{
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
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        isSettled: boolean;
        settledAt: Date | null;
        paidBy: string;
    }>;
    remove(user: AuthUser, familyId: string, expenseId: string): Promise<{
        message: string;
    }>;
}
