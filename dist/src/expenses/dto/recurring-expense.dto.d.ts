import { ExpenseCategory, RecurringFrequency } from '@prisma/client';
export declare class CreateRecurringExpenseDto {
    childId?: string;
    category: ExpenseCategory;
    amount: number;
    currency?: string;
    description: string;
    frequency: RecurringFrequency;
    startDate: string;
    endDate?: string;
    splitRatio?: number;
}
declare const UpdateRecurringExpenseDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateRecurringExpenseDto>>;
export declare class UpdateRecurringExpenseDto extends UpdateRecurringExpenseDto_base {
    isActive?: boolean;
}
export {};
