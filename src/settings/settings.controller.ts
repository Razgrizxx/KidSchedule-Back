import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateFamilySettingsDto } from './dto/update-family-settings.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('families/:familyId/settings')
  getFamilySettings(
    @Param('familyId') familyId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.settingsService.getFamilySettings(familyId, user.id);
  }

  @Patch('families/:familyId/settings')
  updateFamilySettings(
    @Param('familyId') familyId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateFamilySettingsDto,
  ) {
    return this.settingsService.updateFamilySettings(familyId, user.id, dto);
  }

  @Get('users/me/settings')
  getUserSettings(@CurrentUser() user: AuthUser) {
    return this.settingsService.getUserSettings(user.id);
  }

  @Patch('users/me/settings')
  updateUserSettings(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    return this.settingsService.updateUserSettings(user.id, dto);
  }
}
