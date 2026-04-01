import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaregiverLinkExpiry } from '@prisma/client';

@Injectable()
export class CaregiverPortalService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(token: string) {
    const caregiver = await this.prisma.caregiver.findUnique({
      where: { inviteToken: token },
      include: {
        children: { include: { child: true } },
      },
    });

    if (!caregiver) throw new NotFoundException('Invalid access token');
    if (
      caregiver.linkExpiry !== CaregiverLinkExpiry.NEVER &&
      caregiver.linkExpiresAt &&
      caregiver.linkExpiresAt < new Date()
    ) {
      throw new BadRequestException('Access link has expired');
    }

    const children = caregiver.children.map((cc) => cc.child);
    const childIds = children.map((c) => c.id);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch data according to permissions
    const [custodyEvents, contacts, assignedEvents] = await Promise.all([
      caregiver.canViewCalendar && caregiver.familyId && childIds.length > 0
        ? this.prisma.custodyEvent.findMany({
            where: {
              familyId: caregiver.familyId,
              childId: { in: childIds },
              date: { gte: startOfMonth, lte: endOfMonth },
            },
            orderBy: { date: 'asc' },
          })
        : Promise.resolve([]),

      caregiver.canViewEmergencyContacts && caregiver.familyId
        ? this.prisma.familyMember.findMany({
            where: { familyId: caregiver.familyId },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          })
        : Promise.resolve([]),

      // Events explicitly assigned to this caregiver (next 3 months)
      this.prisma.event.findMany({
        where: {
          caregiverId: caregiver.id,
          startAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lte: new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()),
          },
        },
        orderBy: { startAt: 'asc' },
        include: {
          children: {
            include: {
              child: { select: { id: true, firstName: true, lastName: true, color: true } },
            },
          },
        },
      }),
    ]);

    return {
      name: caregiver.name,
      familyId: caregiver.familyId,
      permissions: {
        canViewCalendar: caregiver.canViewCalendar,
        canViewHealthInfo: caregiver.canViewHealthInfo,
        canViewEmergencyContacts: caregiver.canViewEmergencyContacts,
        canViewAllergies: caregiver.canViewAllergies,
      },
      children,
      custodyEvents: caregiver.canViewCalendar ? custodyEvents : [],
      contacts: caregiver.canViewEmergencyContacts
        ? contacts.map((m) => m.user)
        : [],
      assignedEvents,
    };
  }
}
