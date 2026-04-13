import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringExpenseDto, UpdateRecurringExpenseDto } from './dto/recurring-expense.dto';
import { RecurringFrequency } from '@prisma/client';
import { addWeeks, addMonths, addQuarters, addYears, isAfter, isBefore, startOfDay } from 'date-fns';

function nextOccurrence(base: Date, frequency: RecurringFrequency): Date {
  switch (frequency) {
    case RecurringFrequency.WEEKLY:     return addWeeks(base, 1);
    case RecurringFrequency.BIWEEKLY:   return addWeeks(base, 2);
    case RecurringFrequency.MONTHLY:    return addMonths(base, 1);
    case RecurringFrequency.QUARTERLY:  return addQuarters(base, 1);
    case RecurringFrequency.YEARLY:     return addYears(base, 1);
  }
}

@Injectable()
export class RecurringExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(familyId: string, userId: string, dto: CreateRecurringExpenseDto) {
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

  async findAll(familyId: string) {
    return this.prisma.recurringExpense.findMany({
      where: { familyId },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { instances: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(familyId: string, id: string, userId: string, dto: UpdateRecurringExpenseDto) {
    const recurring = await this.prisma.recurringExpense.findFirst({ where: { id, familyId } });
    if (!recurring) throw new NotFoundException('Recurring expense not found');
    if (recurring.createdBy !== userId) throw new ForbiddenException();

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

  async remove(familyId: string, id: string, userId: string) {
    const recurring = await this.prisma.recurringExpense.findFirst({ where: { id, familyId } });
    if (!recurring) throw new NotFoundException('Recurring expense not found');
    if (recurring.createdBy !== userId) throw new ForbiddenException();
    await this.prisma.recurringExpense.delete({ where: { id } });
  }

  async generateDue(familyId: string, userId: string): Promise<{ generated: number }> {
    const templates = await this.prisma.recurringExpense.findMany({
      where: { familyId, isActive: true },
    });

    const today = startOfDay(new Date());
    let generated = 0;

    for (const t of templates) {
      if (t.endDate && isBefore(new Date(t.endDate), today)) continue;

      // Determine the first date we haven't generated yet
      let cursor: Date = t.lastGeneratedAt
        ? nextOccurrence(startOfDay(t.lastGeneratedAt), t.frequency)
        : startOfDay(t.startDate);

      // Collect all due dates up to and including today
      const dueDates: Date[] = [];
      while (!isAfter(cursor, today)) {
        if (!t.endDate || !isAfter(cursor, new Date(t.endDate))) {
          dueDates.push(new Date(cursor));
        }
        cursor = nextOccurrence(cursor, t.frequency);
      }

      if (dueDates.length === 0) continue;

      // Bulk-create expense instances
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

      // Update lastGeneratedAt to the last generated date
      await this.prisma.recurringExpense.update({
        where: { id: t.id },
        data: { lastGeneratedAt: dueDates[dueDates.length - 1] },
      });

      generated += dueDates.length;
    }

    return { generated };
  }
}
