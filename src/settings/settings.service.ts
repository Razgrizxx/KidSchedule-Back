import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { UpdateFamilySettingsDto } from './dto/update-family-settings.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
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
}
