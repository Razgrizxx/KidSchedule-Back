"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ScheduleGeneratorService = class ScheduleGeneratorService {
    generate(pattern, startDate, durationDays, parent1Id, parent2Id) {
        const days = [];
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        for (let i = 0; i < durationDays; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const custodianId = this.getCustodian(pattern, i, date, parent1Id, parent2Id);
            days.push({ date, custodianId });
        }
        return days;
    }
    getCustodian(pattern, dayIndex, date, p1, p2) {
        switch (pattern) {
            case client_1.CustodyPattern.ALTERNATING_WEEKS:
                return this.patternCycle(dayIndex, [7, 7], p1, p2);
            case client_1.CustodyPattern.TWO_TWO_THREE: {
                const weekIndex = Math.floor(dayIndex / 7);
                const dayInWeek = dayIndex % 7;
                const isEvenWeek = weekIndex % 2 === 0;
                if (isEvenWeek) {
                    if (dayInWeek < 2)
                        return p1;
                    if (dayInWeek < 4)
                        return p2;
                    return p1;
                }
                else {
                    if (dayInWeek < 2)
                        return p2;
                    if (dayInWeek < 4)
                        return p1;
                    return p2;
                }
            }
            case client_1.CustodyPattern.THREE_FOUR_FOUR_THREE:
                return this.patternCycle(dayIndex, [3, 4, 4, 3], p1, p2);
            case client_1.CustodyPattern.FIVE_TWO_TWO_FIVE:
                return this.patternCycle(dayIndex, [5, 2, 2, 5], p1, p2);
            case client_1.CustodyPattern.EVERY_OTHER_WEEKEND: {
                const weekNumber = this.getISOWeekNumber(date);
                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
                const isP2Weekend = weekNumber % 2 === 0;
                return isWeekend && isP2Weekend ? p2 : p1;
            }
            default:
                return p1;
        }
    }
    patternCycle(dayIndex, blocks, p1, p2) {
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
    getISOWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }
};
exports.ScheduleGeneratorService = ScheduleGeneratorService;
exports.ScheduleGeneratorService = ScheduleGeneratorService = __decorate([
    (0, common_1.Injectable)()
], ScheduleGeneratorService);
//# sourceMappingURL=schedule-generator.service.js.map