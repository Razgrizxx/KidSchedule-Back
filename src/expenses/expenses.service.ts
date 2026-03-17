import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateExpenseDto) {
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

  async findAll(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.expense.findMany({
      where: { familyId },
      orderBy: { date: 'desc' },
      include: {
        payer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findOne(familyId: string, expenseId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, familyId },
      include: {
        payer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(
    familyId: string,
    expenseId: string,
    userId: string,
    dto: UpdateExpenseDto,
  ) {
    await this.findOne(familyId, expenseId, userId);
    return this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...dto,
        ...(dto.date && { date: new Date(dto.date) }),
      },
    });
  }

  async remove(familyId: string, expenseId: string, userId: string) {
    await this.findOne(familyId, expenseId, userId);
    await this.prisma.expense.delete({ where: { id: expenseId } });
    return { message: 'Expense deleted' };
  }

  /**
   * Calculate balance: for each expense, the payer is owed (amount * splitRatio) by the other parent.
   * Returns net balance per user (positive = owed money, negative = owes money).
   */
  async getBalance(familyId: string, userId: string) {
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

    const balance: Record<string, number> = {};
    members.forEach((m) => (balance[m.userId] = 0));

    for (const expense of expenses) {
      const amount = Number(expense.amount);
      const ratio = Number(expense.splitRatio);
      const otherShare = amount * ratio;

      // Payer is owed otherShare from the other party
      balance[expense.paidBy] = (balance[expense.paidBy] ?? 0) + otherShare;

      // Distribute the debt among other members
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
}
