"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
function nextOccurrence(base, frequency) {
    switch (frequency) {
        case client_1.RecurringFrequency.WEEKLY: return (0, date_fns_1.addWeeks)(base, 1);
        case client_1.RecurringFrequency.BIWEEKLY: return (0, date_fns_1.addWeeks)(base, 2);
        case client_1.RecurringFrequency.MONTHLY: return (0, date_fns_1.addMonths)(base, 1);
        case client_1.RecurringFrequency.QUARTERLY: return (0, date_fns_1.addQuarters)(base, 1);
        case client_1.RecurringFrequency.YEARLY: return (0, date_fns_1.addYears)(base, 1);
    }
}
let RecurringExpensesService = class RecurringExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(familyId, userId, dto) {
        return this.prisma.recurringExpense.create({
            data: {
                familyId,
                createdBy: userId,
                childId: dto.childId,
                category: dto.category,
                amount: dto.amount,
                currency: dto.currency ?? 'USD',
                description: dto.description,
                frequency: dto.frequency,
                startDate: new Date(dto.startDate),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                splitRatio: dto.splitRatio,
            },
        });
    }
    async findAll(familyId) {
        return this.prisma.recurringExpense.findMany({
            where: { familyId },
            include: {
                creator: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { instances: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(familyId, id, userId, dto) {
        const recurring = await this.prisma.recurringExpense.findFirst({ where: { id, familyId } });
        if (!recurring)
            throw new common_1.NotFoundException('Recurring expense not found');
        if (recurring.createdBy !== userId)
            throw new common_1.ForbiddenException();
        return this.prisma.recurringExpense.update({
            where: { id },
            data: {
                ...(dto.category !== undefined && { category: dto.category }),
                ...(dto.amount !== undefined && { amount: dto.amount }),
                ...(dto.currency !== undefined && { currency: dto.currency }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.frequency !== undefined && { frequency: dto.frequency }),
                ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
                ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
                ...(dto.splitRatio !== undefined && { splitRatio: dto.splitRatio }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }
    async remove(familyId, id, userId) {
        const recurring = await this.prisma.recurringExpense.findFirst({ where: { id, familyId } });
        if (!recurring)
            throw new common_1.NotFoundException('Recurring expense not found');
        if (recurring.createdBy !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.recurringExpense.delete({ where: { id } });
    }
    async generateDue(familyId, userId) {
        const templates = await this.prisma.recurringExpense.findMany({
            where: { familyId, isActive: true },
        });
        const today = (0, date_fns_1.startOfDay)(new Date());
        let generated = 0;
        for (const t of templates) {
            if (t.endDate && (0, date_fns_1.isBefore)(new Date(t.endDate), today))
                continue;
            let cursor = t.lastGeneratedAt
                ? nextOccurrence((0, date_fns_1.startOfDay)(t.lastGeneratedAt), t.frequency)
                : (0, date_fns_1.startOfDay)(t.startDate);
            const dueDates = [];
            while (!(0, date_fns_1.isAfter)(cursor, today)) {
                if (!t.endDate || !(0, date_fns_1.isAfter)(cursor, new Date(t.endDate))) {
                    dueDates.push(new Date(cursor));
                }
                cursor = nextOccurrence(cursor, t.frequency);
            }
            if (dueDates.length === 0)
                continue;
            await this.prisma.expense.createMany({
                data: dueDates.map((date) => ({
                    familyId,
                    paidBy: userId,
                    childId: t.childId,
                    category: t.category,
                    amount: t.amount,
                    currency: t.currency,
                    description: t.description,
                    date,
                    splitRatio: t.splitRatio,
                    recurringId: t.id,
                })),
                skipDuplicates: true,
            });
            await this.prisma.recurringExpense.update({
                where: { id: t.id },
                data: { lastGeneratedAt: dueDates[dueDates.length - 1] },
            });
            generated += dueDates.length;
        }
        return { generated };
    }
};
exports.RecurringExpensesService = RecurringExpensesService;
exports.RecurringExpensesService = RecurringExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecurringExpensesService);
//# sourceMappingURL=recurring-expenses.service.js.map