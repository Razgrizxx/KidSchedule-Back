import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateMomentDto } from './dto/moment.dto';

@Injectable()
export class MomentsService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(
    familyId: string,
    userId: string,
    dto: CreateMomentDto,
    file: Express.Multer.File,
  ) {
    await this.familyService.assertMember(familyId, userId);

    const result = await this.cloudinary.upload(
      file,
      `kidschedule/moments/${familyId}`,
    );

    return this.prisma.moment.create({
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
      await this.cloudinary.delete(moment.cloudinaryPublicId);
    }

    await this.prisma.moment.delete({ where: { id: momentId } });
    return { message: 'Moment deleted' };
  }
}
