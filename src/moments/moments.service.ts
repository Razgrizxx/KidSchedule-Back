import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { LocalStorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMomentDto } from './dto/moment.dto';
import { SubscriptionService, FREE_MOMENTS_LIMIT } from '../stripe/subscription.service';

@Injectable()
export class MomentsService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private storage: LocalStorageService,
    private subService: SubscriptionService,
    private notifications: NotificationsService,
  ) {}

  async create(
    familyId: string,
    userId: string,
    dto: CreateMomentDto,
    file: Express.Multer.File,
  ) {
    await this.familyService.assertMember(familyId, userId);

    // Enforce free-plan moments limit
    const hasUnlimited = await this.subService.hasFeature(userId, 'moments_unlimited');
    if (!hasUnlimited) {
      const count = await this.prisma.moment.count({ where: { familyId } });
      if (count >= FREE_MOMENTS_LIMIT) {
        throw new ForbiddenException(
          `Free plan is limited to ${FREE_MOMENTS_LIMIT} photos. Upgrade to Plus to upload unlimited moments.`,
        );
      }
    }

    const result = await this.storage.upload(
      file,
      `kidschedule/moments/${familyId}`,
    );

    const moment = await this.prisma.moment.create({
      data: {
        familyId,
        uploadedBy: userId,
        childId: dto.childId,
        caption: dto.caption,
        mediaUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
      },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true } },
        child: { select: { id: true, firstName: true, color: true } },
      },
    });

    // Push notification to co-parent (fire-and-forget)
    const uploaderName = moment.uploader
      ? `${moment.uploader.firstName} ${moment.uploader.lastName}`
      : 'Your co-parent';
    const childName = moment.child?.firstName ?? '';
    void this.notifications.sendToFamily(familyId, userId, {
      title: `${uploaderName} shared a moment`,
      body: moment.caption
        ? `${childName}: ${moment.caption}`
        : `New photo of ${childName}`,
      data: { type: 'MOMENT', familyId, momentId: moment.id },
    }).catch(() => {});

    return moment;
  }

  async findAll(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.moment.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true } },
        child: { select: { id: true, firstName: true, color: true } },
      },
    });
  }

  async remove(familyId: string, momentId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const moment = await this.prisma.moment.findFirst({
      where: { id: momentId, familyId },
    });
    if (!moment) throw new NotFoundException('Moment not found');
    if (moment.uploadedBy !== userId)
      throw new ForbiddenException('Only uploader can delete');

    if (moment.cloudinaryPublicId) {
      await this.storage.delete(moment.cloudinaryPublicId);
    }

    await this.prisma.moment.delete({ where: { id: momentId } });
    return { message: 'Moment deleted' };
  }
}
