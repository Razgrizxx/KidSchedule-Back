import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
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
import { GoogleAuthService } from './google-auth.service';
import { GoogleCalendarSyncService } from './google-calendar-sync.service';

@Controller('auth/google')
export class GoogleController {
  constructor(
    private readonly googleAuth: GoogleAuthService,
    private readonly googleSync: GoogleCalendarSyncService,
    private readonly config: ConfigService,
  ) {}

  /** Returns the Google OAuth URL. Client redirects the browser to it. */
  @UseGuards(JwtAuthGuard)
  @Get('url')
  getAuthUrl(@CurrentUser() user: AuthUser) {
    return { url: this.googleAuth.getAuthUrl(user.id) };
  }

  /** Google redirects here after user consents. No JWT — userId is in the state param. */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:5173');
    const redirectBase = `${appUrl}/dashboard/settings`;

    if (error || !code) {
      return res.redirect(`${redirectBase}?google=error`);
    }

    try {
      const userId = this.googleAuth.verifyState(state);
      await this.googleAuth.handleCallback(code, userId);
      return res.redirect(`${redirectBase}?google=connected`);
    } catch {
      return res.redirect(`${redirectBase}?google=error`);
    }
  }

  /** Check whether the current user has connected Google Calendar. */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@CurrentUser() user: AuthUser) {
    return this.googleAuth.getStatus(user.id);
  }

  /** Remove stored tokens (disconnect). */
  @UseGuards(JwtAuthGuard)
  @Delete('disconnect')
  disconnect(@CurrentUser() user: AuthUser) {
    return this.googleAuth.disconnect(user.id);
  }

  /** Trigger a full sync of all upcoming family events to Google Calendar. */
  @UseGuards(JwtAuthGuard)
  @Get('sync/:familyId')
  syncAll(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
  ) {
    return this.googleSync.syncAllEvents(familyId, user.id);
  }

  /**
   * Export all custody blocks + calendar events to Google Calendar.
   * Optionally cleans up stale Google events before re-creating.
   */
  @UseGuards(JwtAuthGuard)
  @Post('export/:familyId')
  exportAll(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() body: { cleanup?: boolean },
  ) {
    return this.googleSync.syncAllEvents(familyId, user.id, body.cleanup ?? false);
  }
}
