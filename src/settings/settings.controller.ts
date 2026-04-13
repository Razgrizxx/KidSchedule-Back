import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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

  @Post('users/me/fcm-token')
  registerFcmToken(
    @CurrentUser() user: AuthUser,
    @Body('token') token: string,
  ) {
    if (!token) throw new BadRequestException('token is required');
    return this.settingsService.registerFcmToken(user.id, token);
  }

  @Delete('users/me/fcm-token')
  removeFcmToken(
    @CurrentUser() user: AuthUser,
    @Body('token') token: string,
  ) {
    if (!token) throw new BadRequestException('token is required');
    return this.settingsService.removeFcmToken(user.id, token);
  }

  @Post('users/me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    return this.settingsService.uploadAvatar(user.id, file);
  }
}
