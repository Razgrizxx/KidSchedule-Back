import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class ExpensesController {
    private expensesService;
    constructor(expensesService: ExpensesService);
    create(user: AuthUser, familyId: string, dto: CreateExpenseDto): Promise<{
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
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        description: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        paidBy: string;
    })[]>;
    getBalance(user: AuthUser, familyId: string): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
        balance: number;
    }[]>;
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
        category: import("@prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        description: string;
        receiptUrl: string | null;
        splitRatio: import("@prisma/client-runtime-utils").Decimal;
        paidBy: string;
    }>;
    update(user: AuthUser, familyId: string, expenseId: string, dto: UpdateExpenseDto): Promise<{
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
        paidBy: string;
    }>;
    remove(user: AuthUser, familyId: string, expenseId: string): Promise<{
        message: string;
    }>;
}
