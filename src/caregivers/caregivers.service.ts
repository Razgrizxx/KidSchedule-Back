import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { MailService } from '../mail/mail.service';
import { CreateCaregiverDto, UpdateCaregiverDto } from './dto/caregiver.dto';
import { CaregiverLinkExpiry, CaregiverVisibility } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CaregiversService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateCaregiverDto) {
    await this.familyService.assertMember(familyId, userId);

    const inviteToken = uuidv4();
    const linkExpiresAt = this.calculateExpiry(dto.linkExpiry);

    const { sendEmail, ...caregiverData } = dto;

    const caregiver = await this.prisma.caregiver.create({
      data: {
        ...caregiverData,
        familyId,
        createdBy: userId,
        inviteToken,
        linkExpiresAt,
      },
    });

    if (sendEmail && caregiver.email) {
      void this.sendCaregiverEmail(caregiver, userId, familyId, inviteToken);
    }

    return caregiver;
  }

  async findAll(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);

    return this.prisma.caregiver.findMany({
      where: {
        familyId,
        OR: [
          { visibility: CaregiverVisibility.SHARED },
          { createdBy: userId, visibility: CaregiverVisibility.PRIVATE },
        ],
      },
      include: { children: { include: { child: true } } },
    });
  }

  async findOne(familyId: string, caregiverId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const caregiver = await this.prisma.caregiver.findFirst({
      where: { id: caregiverId, familyId },
    });
    if (!caregiver) throw new NotFoundException('Caregiver not found');
    if (
      caregiver.visibility === CaregiverVisibility.PRIVATE &&
      caregiver.createdBy !== userId
    ) {
      throw new ForbiddenException('Access denied to private caregiver');
    }
    return caregiver;
  }

  async update(
    familyId: string,
    caregiverId: string,
    userId: string,
    dto: UpdateCaregiverDto,
  ) {
    const caregiver = await this.findOne(familyId, caregiverId, userId);
    if (caregiver.createdBy !== userId)
      throw new ForbiddenException('Only creator can update');

    return this.prisma.caregiver.update({
      where: { id: caregiverId },
      data: {
        ...dto,
        ...(dto.linkExpiry && {
          linkExpiresAt: this.calculateExpiry(dto.linkExpiry),
        }),
      },
    });
  }

  async remove(familyId: string, caregiverId: string, userId: string) {
    const caregiver = await this.findOne(familyId, caregiverId, userId);
    if (caregiver.createdBy !== userId)
      throw new ForbiddenException('Only creator can delete');
    await this.prisma.caregiver.delete({ where: { id: caregiverId } });
    return { message: 'Caregiver deleted' };
  }

  async assignToChild(
    familyId: string,
    caregiverId: string,
    childId: string,
    userId: string,
  ) {
    await this.findOne(familyId, caregiverId, userId);
    return this.prisma.childCaregiver.upsert({
      where: { childId_caregiverId: { childId, caregiverId } },
      create: { childId, caregiverId },
      update: {},
    });
  }

  async resolveByToken(token: string) {
    const caregiver = await this.prisma.caregiver.findUnique({
      where: { inviteToken: token },
      include: { children: { include: { child: true } } },
    });
    if (!caregiver) throw new NotFoundException('Invalid token');
    if (
      caregiver.linkExpiry !== CaregiverLinkExpiry.NEVER &&
      caregiver.linkExpiresAt &&
      caregiver.linkExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invite link has expired');
    }
    return {
      name: caregiver.name,
      canViewCalendar: caregiver.canViewCalendar,
      canViewHealthInfo: caregiver.canViewHealthInfo,
      canViewEmergencyContacts: caregiver.canViewEmergencyContacts,
      children: caregiver.children.map((cc) => cc.child),
    };
  }

  private async sendCaregiverEmail(
    caregiver: { id: string; name: string; email: string | null; canViewCalendar: boolean; canViewHealthInfo: boolean; canViewEmergencyContacts: boolean; canViewAllergies: boolean },
    userId: string,
    familyId: string,
    inviteToken: string,
  ): Promise<void> {
    if (!caregiver.email) return;

    const [inviter, family] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.family.findUnique({
        where: { id: familyId },
        include: { children: true },
      }),
    ]);

    if (!inviter || !family) return;

    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:5173');
    await this.mail.sendCaregiverInvitation({
      toEmail: caregiver.email,
      caregiverName: caregiver.name,
      inviterName: `${inviter.firstName} ${inviter.lastName}`,
      familyName: family.name,
      childrenNames: family.children.map((c) => c.firstName),
      inviteToken,
      appUrl,
      permissions: {
        canViewCalendar: caregiver.canViewCalendar,
        canViewHealthInfo: caregiver.canViewHealthInfo,
        canViewEmergencyContacts: caregiver.canViewEmergencyContacts,
        canViewAllergies: caregiver.canViewAllergies,
      },
    });
  }

  private calculateExpiry(expiry: CaregiverLinkExpiry): Date | null {
    const daysMap: Partial<Record<CaregiverLinkExpiry, number>> = {
      [CaregiverLinkExpiry.SEVEN_DAYS]: 7,
      [CaregiverLinkExpiry.THIRTY_DAYS]: 30,
      [CaregiverLinkExpiry.NINETY_DAYS]: 90,
      [CaregiverLinkExpiry.ONE_YEAR]: 365,
    };
    if (expiry === CaregiverLinkExpiry.NEVER) return null;
    const days = daysMap[expiry] ?? 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}
