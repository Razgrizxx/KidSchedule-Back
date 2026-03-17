import { Injectable } from '@nestjs/common';
import { CustodyPattern } from '@prisma/client';

export interface DayAssignment {
  date: Date;
  custodianId: string;
}

/**
 * ScheduleGeneratorService
 *
 * Generates an array of day-by-day custody assignments for a given
 * custody pattern, start date, duration, and two parent IDs.
 *
 * Pattern definitions (days per block, cycling between parent1/parent2):
 *  - ALTERNATING_WEEKS:     [7, 7]
 *  - TWO_TWO_THREE:         [2, 2, 3] → [2, 2, 3] (swapped each cycle)
 *  - THREE_FOUR_FOUR_THREE: [3, 4, 4, 3]
 *  - FIVE_TWO_TWO_FIVE:     [5, 2, 2, 5]
 *  - EVERY_OTHER_WEEKEND:   Parent2 gets Fri-Sun every other week, else Parent1
 */
@Injectable()
export class ScheduleGeneratorService {
  generate(
    pattern: CustodyPattern,
    startDate: Date,
    durationDays: number,
    parent1Id: string,
    parent2Id: string,
  ): DayAssignment[] {
    const days: DayAssignment[] = [];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < durationDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const custodianId = this.getCustodian(
        pattern,
        i,
        date,
        parent1Id,
        parent2Id,
      );
      days.push({ date, custodianId });
    }

    return days;
  }

  private getCustodian(
    pattern: CustodyPattern,
    dayIndex: number,
    date: Date,
    p1: string,
    p2: string,
  ): string {
    switch (pattern) {
      case CustodyPattern.ALTERNATING_WEEKS:
        return this.patternCycle(dayIndex, [7, 7], p1, p2);

      case CustodyPattern.TWO_TWO_THREE: {
        // Week 1: P1×2, P2×2, P1×3 | Week 2: P2×2, P1×2, P2×3
        const weekIndex = Math.floor(dayIndex / 7);
        const dayInWeek = dayIndex % 7;
        const isEvenWeek = weekIndex % 2 === 0;
        if (isEvenWeek) {
          if (dayInWeek < 2) return p1;
          if (dayInWeek < 4) return p2;
          return p1;
        } else {
          if (dayInWeek < 2) return p2;
          if (dayInWeek < 4) return p1;
          return p2;
        }
      }

      case CustodyPattern.THREE_FOUR_FOUR_THREE:
        return this.patternCycle(dayIndex, [3, 4, 4, 3], p1, p2);

      case CustodyPattern.FIVE_TWO_TWO_FIVE:
        return this.patternCycle(dayIndex, [5, 2, 2, 5], p1, p2);

      case CustodyPattern.EVERY_OTHER_WEEKEND: {
        // P2 gets Fri(5), Sat(6), Sun(0) on even ISO weeks; P1 gets all other days
        const weekNumber = this.getISOWeekNumber(date);
        const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
        const isP2Weekend = weekNumber % 2 === 0;
        return isWeekend && isP2Weekend ? p2 : p1;
      }

      default:
        return p1;
    }
  }

  /**
   * Generic cycle helper.
   * blocks = [3, 4, 4, 3] means: p1×3, p2×4, p1×4, p2×3, then repeat.
   * Parents alternate ownership of each block.
   */
  private patternCycle(
    dayIndex: number,
    blocks: number[],
    p1: string,
    p2: string,
  ): string {
    const cycleLength = blocks.reduce((a, b) => a + b, 0);
    const posInCycle = dayIndex % cycleLength;

    let accumulated = 0;
    for (let i = 0; i < blocks.length; i++) {
      accumulated += blocks[i];
      if (posInCycle < accumulated) {
        return i % 2 === 0 ? p1 : p2;
      }
    }
    return p1;
  }

  private getISOWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
