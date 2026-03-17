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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
let ExpensesService = class ExpensesService {
    prisma;
    familyService;
    constructor(prisma, familyService) {
        this.prisma = prisma;
        this.familyService = familyService;
    }
    async create(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.expense.create({
            data: {
                familyId,
                paidBy: userId,
                ...dto,
                amount: dto.amount,
                splitRatio: dto.splitRatio ?? 0.5,
                date: new Date(dto.date),
            },
        });
    }
    async findAll(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.expense.findMany({
            where: { familyId },
            orderBy: { date: 'desc' },
            include: {
                payer: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async findOne(familyId, expenseId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const expense = await this.prisma.expense.findFirst({
            where: { id: expenseId, familyId },
            include: {
                payer: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        return expense;
    }
    async update(familyId, expenseId, userId, dto) {
        await this.findOne(familyId, expenseId, userId);
        return this.prisma.expense.update({
            where: { id: expenseId },
            data: {
                ...dto,
                ...(dto.date && { date: new Date(dto.date) }),
            },
        });
    }
    async remove(familyId, expenseId, userId) {
        await this.findOne(familyId, expenseId, userId);
        await this.prisma.expense.delete({ where: { id: expenseId } });
        return { message: 'Expense deleted' };
    }
    async getBalance(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const members = await this.prisma.familyMember.findMany({
            where: { familyId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        const expenses = await this.prisma.expense.findMany({
            where: { familyId },
        });
        const balance = {};
        members.forEach((m) => (balance[m.userId] = 0));
        for (const expense of expenses) {
            const amount = Number(expense.amount);
            const ratio = Number(expense.splitRatio);
            const otherShare = amount * ratio;
            balance[expense.paidBy] = (balance[expense.paidBy] ?? 0) + otherShare;
            const others = members.filter((m) => m.userId !== expense.paidBy);
            const perPerson = otherShare / (others.length || 1);
            others.forEach((m) => {
                balance[m.userId] = (balance[m.userId] ?? 0) - perPerson;
            });
        }
        return members.map((m) => ({
            user: m.user,
            balance: Math.round(balance[m.userId] * 100) / 100,
        }));
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map