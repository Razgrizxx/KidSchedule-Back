import { ExpenseCategory } from '@prisma/client';
export declare class CreateExpenseDto {
    childId?: string;
    category: ExpenseCategory;
    amount: number;
    currency?: string;
    description: string;
    date: string;
    receiptUrl?: string;
    splitRatio?: number;
}
declare const UpdateExpenseDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateExpenseDto>>;
export declare class UpdateExpenseDto extends UpdateExpenseDto_base {
}
export declare class SettleExpenseDto {
    isSettled?: boolean;
}
export {};
