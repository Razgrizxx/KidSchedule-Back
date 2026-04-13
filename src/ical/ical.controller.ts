import { Controller, Delete, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { IcalService } from './ical.service';

@Controller()
export class IcalController {
  constructor(
    private readonly ical: IcalService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Returns the webcal:// URL for this user's iCal feed.
   * Creates the token on first call.
   */
  @UseGuards(JwtAuthGuard)
  @Get('ical/feed-url')
  async getFeedUrl(@CurrentUser() user: AuthUser) {
    const token   = await this.ical.getOrCreateFeedToken(user.id);
    const baseUrl = this.config.get<string>('API_URL', 'http://localhost:3000/api/v1');
    // Replace http(s):// with webcal:// so Apple Calendar picks it up automatically
    const feedUrl = `${baseUrl}/ical/${token}/calendar.ics`.replace(/^https?:\/\//, 'webcal://');
    return { feedUrl, token };
  }

  /**
   * Rotate the feed token (invalidates old subscriptions).
   */
  @UseGuards(JwtAuthGuard)
  @Delete('ical/feed-url')
  async rotateFeedToken(@CurrentUser() user: AuthUser) {
    const token   = await this.ical.rotateFeedToken(user.id);
    const baseUrl = this.config.get<string>('API_URL', 'http://localhost:3000/api/v1');
    const feedUrl = `${baseUrl}/ical/${token}/calendar.ics`.replace(/^https?:\/\//, 'webcal://');
    return { feedUrl, token };
  }

  /**
   * Public endpoint — no auth — served by the webcal:// URL.
   * Returns the .ics file for Apple Calendar / any iCal-compatible app.
   */
  @Get('ical/:token/calendar.ics')
  async getFeed(@Param('token') token: string, @Res() res: Response) {
    try {
      const content = await this.ical.generateFeed(token);
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="kidschedule.ics"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(content);
    } catch {
      return res.status(404).send('Feed not found');
    }
  }
}
