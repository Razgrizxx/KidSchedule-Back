import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateFamilySettingsDto } from './dto/update-family-settings.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private cloudinary: CloudinaryService,
  ) {}

  async getFamilySettings(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.familySettings.upsert({
      where: { familyId },
      create: { familyId },
      update: {},
    });
  }

  async updateFamilySettings(
    familyId: string,
    userId: string,
    dto: UpdateFamilySettingsDto,
  ) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.familySettings.upsert({
      where: { familyId },
      create: { familyId, ...dto },
      update: dto,
    });
  }

  async getUserSettings(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async updateUserSettings(userId: string, dto: UpdateUserSettingsDto) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  async registerFcmToken(userId: string, token: string) {
    // Add token if not already present (set-like behaviour)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });
    if (user && !user.fcmTokens.includes(token)) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fcmTokens: { push: token } },
      });
    }
    return { ok: true };
  }

  async removeFcmToken(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });
    if (user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fcmTokens: { set: user.fcmTokens.filter((t) => t !== token) } },
      });
    }
    return { ok: true };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    // Delete old avatar from Cloudinary if it exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });
    if (user?.avatarUrl) {
      const match = user.avatarUrl.match(/kidschedule\/avatars\/[^/.]+/);
      if (match) await this.cloudinary.delete(match[0]).catch(() => null);
    }

    const result = await this.cloudinary.upload(file, `kidschedule/avatars`);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: result.secure_url },
      select: { avatarUrl: true },
    });
    return { avatarUrl: updated.avatarUrl };
  }
}
