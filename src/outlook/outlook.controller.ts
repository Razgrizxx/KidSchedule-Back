import {
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
  Param,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { OutlookAuthService } from './outlook-auth.service';
import { OutlookCalendarSyncService } from './outlook-calendar-sync.service';

@Controller('auth/outlook')
export class OutlookController {
  private readonly logger = new Logger(OutlookController.name);

  constructor(
    private readonly outlookAuth: OutlookAuthService,
    private readonly outlookSync: OutlookCalendarSyncService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('url')
  getAuthUrl(@CurrentUser() user: AuthUser) {
    return { url: this.outlookAuth.getAuthUrl(user.id) };
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:5173');
    const redirectBase = `${appUrl}/#/dashboard/settings`;

    if (error || !code) {
      return res.redirect(`${redirectBase}?outlook=error`);
    }

    try {
      const userId = this.outlookAuth.verifyState(state);
      await this.outlookAuth.handleCallback(code, userId);
      return res.redirect(`${redirectBase}?outlook=connected`);
    } catch {
      return res.redirect(`${redirectBase}?outlook=error`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@CurrentUser() user: AuthUser) {
    return this.outlookAuth.getStatus(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('disconnect')
  disconnect(@CurrentUser() user: AuthUser) {
    return this.outlookAuth.disconnect(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('export/:familyId')
  async exportAll(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() body: { cleanup?: boolean },
  ) {
    try {
      return await this.outlookSync.syncAllEvents(familyId, user.id, body.cleanup ?? false);
    } catch (err) {
      this.logger.error('Outlook Calendar export failed', err);
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Outlook Calendar export failed',
      );
    }
  }
}
