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

  /** Mark a single expense as settled. */
  async settle(familyId: string, expenseId: string, userId: string) {
    await this.findOne(familyId, expenseId, userId);
    return this.prisma.expense.update({
      where: { id: expenseId },
      data: { isSettled: true, settledAt: new Date() },
      include: {
        payer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /** Mark a single expense as unsettled (undo). */
  async unsettle(familyId: string, expenseId: string, userId: string) {
    await this.findOne(familyId, expenseId, userId);
    return this.prisma.expense.update({
      where: { id: expenseId },
      data: { isSettled: false, settledAt: null },
      include: {
        payer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /** Settle all currently unsettled expenses in the family. */
  async settleAll(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const result = await this.prisma.expense.updateMany({
      where: { familyId, isSettled: false },
      data: { isSettled: true, settledAt: new Date() },
    });
    return { settled: result.count };
  }

  /**
   * Returns the net pending balance per family member (unsettled expenses only),
   * plus a settled total for context.
   */
  async getBalance(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);

    const members = await this.prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const [pending, settled] = await Promise.all([
      this.prisma.expense.findMany({ where: { familyId, isSettled: false } }),
      this.prisma.expense.findMany({ where: { familyId, isSettled: true } }),
    ]);

    // Calculate pending balance per member
    const balance: Record<string, number> = {};
    members.forEach((m) => (balance[m.userId] = 0));

    for (const expense of pending) {
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

    // Total settled amount (sum of all settled expense amounts)
    const totalSettled = settled.reduce((s, e) => s + Number(e.amount), 0);
    const pendingCount = pending.length;
    const settledCount = settled.length;

    return {
      members: members.map((m) => ({
        user: m.user,
        balance: Math.round(balance[m.userId] * 100) / 100,
      })),
      summary: {
        pendingCount,
        settledCount,
        totalSettled: Math.round(totalSettled * 100) / 100,
      },
    };
  }

  async exportCsv(
    familyId: string,
    _userId: string,
    from?: string,
    to?: string,
  ): Promise<string> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        familyId,
        ...(from && { date: { gte: new Date(from) } }),
        ...(to && { date: { lte: new Date(to + 'T23:59:59Z') } }),
      },
      include: {
        payer: { select: { firstName: true, lastName: true } },
        child: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'asc' },
    });

    const esc = (v: string | number | null | undefined) =>
      `"${String(v ?? '').replace(/"/g, '""')}"`;

    const header = [
      'Date', 'Description', 'Category', 'Amount', 'Currency',
      'Paid By', 'Child', 'Split Ratio (%)', 'Status', 'Settled At',
    ].map(esc).join(',');

    const rows = expenses.map((e) =>
      [
        esc(new Date(e.date).toLocaleDateString('en-CA')),
        esc(e.description),
        esc(e.category),
        esc(Number(e.amount).toFixed(2)),
        esc(e.currency),
        esc(`${e.payer.firstName} ${e.payer.lastName}`),
        esc(e.child ? `${e.child.firstName} ${e.child.lastName}` : ''),
        esc((Number(e.splitRatio) * 100).toFixed(0)),
        esc(e.isSettled ? 'Settled' : 'Pending'),
        esc(e.settledAt ? new Date(e.settledAt).toLocaleDateString('en-CA') : ''),
      ].join(','),
    );

    return [header, ...rows].join('\r\n');
  }
}
