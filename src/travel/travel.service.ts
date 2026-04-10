import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { CreateTravelNoticeDto } from './dto/travel-notice.dto';

@Injectable()
export class TravelService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private audit: AuditService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateTravelNoticeDto) {
    const notice = await this.prisma.travelNotice.create({
      data: {
        familyId,
        createdBy: userId,
        childId: dto.childId ?? null,
        destination: dto.destination,
        departureDate: new Date(dto.departureDate),
        returnDate: new Date(dto.returnDate),
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        notes: dto.notes,
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        child: { select: { id: true, firstName: true } },
      },
    });

    // Notify co-parent
    const childLabel = notice.child ? ` with ${notice.child.firstName}` : '';
    this.notifications.sendToFamily(familyId, userId, {
      title: '✈️ Travel Notice',
      body: `${notice.creator.firstName} is traveling${childLabel} to ${dto.destination} (${dto.departureDate} – ${dto.returnDate})`,
    }).catch(() => {});

    return notice;
  }

  async findAll(familyId: string) {
    return this.prisma.travelNotice.findMany({
      where: { familyId },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        acknowledger: { select: { id: true, firstName: true } },
        child: { select: { id: true, firstName: true, color: true } },
      },
      orderBy: { departureDate: 'desc' },
    });
  }

  async acknowledge(familyId: string, id: string, userId: string) {
    const notice = await this.prisma.travelNotice.findFirst({ where: { id, familyId } });
    if (!notice) throw new NotFoundException('Travel notice not found');
    if (notice.createdBy === userId) throw new ForbiddenException('Cannot acknowledge your own notice');
    if (notice.acknowledgedBy) throw new ForbiddenException('Already acknowledged');

    return this.prisma.travelNotice.update({
      where: { id },
      data: { acknowledgedBy: userId, acknowledgedAt: new Date() },
      include: {
        creator: { select: { id: true, firstName: true } },
        acknowledger: { select: { id: true, firstName: true } },
        child: { select: { id: true, firstName: true, color: true } },
      },
    });
  }

  async remove(familyId: string, id: string, userId: string) {
    const notice = await this.prisma.travelNotice.findFirst({ where: { id, familyId } });
    if (!notice) throw new NotFoundException('Travel notice not found');
    if (notice.createdBy !== userId) throw new ForbiddenException('Only the creator can delete');
    await this.prisma.travelNotice.delete({ where: { id } });
  }
}
