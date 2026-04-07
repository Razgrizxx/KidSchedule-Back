import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addHours, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getToday(familyId: string, userId: string) {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const next48h = addHours(now, 48);

    const [
      custodyToday,
      eventsToday,
      eventsNext48h,
      pendingTotal,
      pendingIncoming,
      unreadMessages,
      nextHandoff,
      familyMembers,
    ] = await Promise.all([
      // Custody events for today
      this.prisma.custodyEvent.findMany({
        where: {
          familyId,
          date: { gte: todayStart, lte: todayEnd },
        },
        include: {
          child: { select: { id: true, firstName: true, color: true } },
        },
        orderBy: { date: 'asc' },
      }),

      // Calendar events happening today
      this.prisma.event.findMany({
        where: {
          familyId,
          startAt: { gte: todayStart, lte: todayEnd },
        },
        include: {
          assignedTo: { select: { id: true, firstName: true } },
        },
        orderBy: { startAt: 'asc' },
        take: 10,
      }),

      // Events in the next 48 hours (excluding today)
      this.prisma.event.findMany({
        where: {
          familyId,
          startAt: { gt: todayEnd, lte: next48h },
        },
        include: {
          assignedTo: { select: { id: true, firstName: true } },
        },
        orderBy: { startAt: 'asc' },
        take: 5,
      }),

      // Pending change requests — total
      this.prisma.changeRequest.count({
        where: { familyId, status: 'PENDING' },
      }),

      // Pending change requests — incoming (not from me)
      this.prisma.changeRequest.count({
        where: { familyId, status: 'PENDING', requesterId: { not: userId } },
      }),

      // Unread messages: from others, not yet READ, last 7 days
      this.prisma.message.count({
        where: {
          familyId,
          senderId: { not: userId },
          isSystemMessage: false,
          status: { not: 'READ' },
          createdAt: { gte: addHours(now, -7 * 24) },
        },
      }),

      // Next upcoming handoff for this user
      this.prisma.handoffLog.findFirst({
        where: {
          familyId,
          handoffAt: { gte: now },
          OR: [{ fromParentId: userId }, { toParentId: userId }],
        },
        include: {
          child: { select: { id: true, firstName: true, color: true } },
          fromParent: { select: { id: true, firstName: true } },
          toParent: { select: { id: true, firstName: true } },
        },
        orderBy: { handoffAt: 'asc' },
      }),

      // Family members to resolve custodian names
      this.prisma.familyMember.findMany({
        where: { familyId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      }),
    ]);

    return {
      date: now.toISOString(),
      custodyToday: custodyToday.map((e) => {
        const member = familyMembers.find((m) => m.userId === e.custodianId);
        return {
          childId: e.childId,
          childName: e.child.firstName,
          childColor: e.child.color,
          custodianId: e.custodianId,
          custodianName: member
            ? `${member.user.firstName} ${member.user.lastName}`
            : 'Co-parent',
          isMyDay: e.custodianId === userId,
        };
      }),
      eventsToday: eventsToday.map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        startAt: e.startAt,
        allDay: e.allDay,
        assignedTo: e.assignedTo
          ? { id: e.assignedTo.id, firstName: e.assignedTo.firstName }
          : null,
      })),
      eventsNext48h: eventsNext48h.map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        startAt: e.startAt,
        allDay: e.allDay,
      })),
      pendingRequests: {
        total: pendingTotal,
        incomingForMe: pendingIncoming,
      },
      unreadMessages,
      nextHandoff: nextHandoff
        ? {
            handoffAt: nextHandoff.handoffAt,
            childName: nextHandoff.child.firstName,
            childColor: nextHandoff.child.color,
            fromParent: nextHandoff.fromParent.firstName,
            toParent: nextHandoff.toParent.firstName,
            isReceiving: nextHandoff.toParentId === userId,
            confirmedAt: nextHandoff.confirmedAt,
          }
        : null,
    };
  }
}
