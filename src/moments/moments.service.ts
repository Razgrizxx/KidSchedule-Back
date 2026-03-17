import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CreateMomentDto } from './dto/moment.dto';

@Injectable()
export class MomentsService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateMomentDto) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.moment.create({
      data: {
        familyId,
        uploadedBy: userId,
        ...dto,
        takenAt: dto.takenAt ? new Date(dto.takenAt) : undefined,
      },
    });
  }

  async findAll(familyId: string, userId: string, childId?: string) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.moment.findMany({
      where: { familyId, ...(childId && { childId }) },
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
    await this.prisma.moment.delete({ where: { id: momentId } });
    return { message: 'Moment deleted' };
  }
}
