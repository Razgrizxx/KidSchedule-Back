import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { User, Event as PrismaEvent, EventChild, Child } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthService } from './google-auth.service';
import { decrypt, encrypt } from './crypto.util';

// ── Event payload emitted by EventsService ────────────────────────────────────

export interface CalendarEventUpsertPayload {
  eventId: string;
  userId: string;
}

// ── Google Calendar color IDs (1–11) ─────────────────────────────────────────
// Maps KidSchedule EventType to Google Calendar colorId

const EVENT_TYPE_COLOR: Record<string, string> = {
  CUSTODY_TIME: '8',  // graphite
  SCHOOL:       '9',  // blueberry
  MEDICAL:      '11', // tomato
  ACTIVITY:     '5',  // banana
  VACATION:     '7',  // peacock
  OTHER:        '1',  // lavender
};

type EventWithChildren = PrismaEvent & {
  children: (EventChild & { child: Child })[];
};

@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly googleAuth: GoogleAuthService,
  ) {}

  // ── Listen for KidSchedule event changes ─────────────────────────────────

  @OnEvent('calendar.event.upsert', { async: true })
  async handleEventUpsert(payload: CalendarEventUpsertPayload): Promise<void> {
    const { eventId, userId } = payload;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.googleRefreshToken) return; // user not connected

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        children: { include: { child: true } },
      },
    });
    if (!event) return;

    try {
      const oauth2Client = await this.getRefreshedClient(user);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const googleEvent = this.mapToGoogleEvent(event as EventWithChildren);

      if (event.googleEventId) {
        // Update existing Google event
        await calendar.events.patch({
          calendarId: 'primary',
          eventId: event.googleEventId,
          requestBody: googleEvent,
        });
        this.logger.log(`Updated Google event ${event.googleEventId} for event ${eventId}`);
      } else {
        // Create new Google event and store the returned ID
        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: googleEvent,
        });
        const googleEventId = response.data.id;
        if (googleEventId) {
          await this.prisma.event.update({
            where: { id: eventId },
            data: { googleEventId },
          });
          this.logger.log(`Created Google event ${googleEventId} for event ${eventId}`);
        }
      }
    } catch (err) {
      this.logger.error(`Google Calendar sync failed for event ${eventId}`, err);
    }
  }

  // ── Full sync: push all family events ────────────────────────────────────

  async syncAllEvents(familyId: string, userId: string): Promise<{ synced: number }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.googleRefreshToken) {
      return { synced: 0 };
    }

    const events = await this.prisma.event.findMany({
      where: { familyId, startAt: { gte: new Date() } },
      include: { children: { include: { child: true } } },
    });

    const oauth2Client = await this.getRefreshedClient(user);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    let synced = 0;
    for (const event of events) {
      try {
        const googleEvent = this.mapToGoogleEvent(event as EventWithChildren);

        if (event.googleEventId) {
          await calendar.events.patch({
            calendarId: 'primary',
            eventId: event.googleEventId,
            requestBody: googleEvent,
          });
        } else {
          const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: googleEvent,
          });
          if (response.data.id) {
            await this.prisma.event.update({
              where: { id: event.id },
              data: { googleEventId: response.data.id },
            });
          }
        }
        synced++;
      } catch (err) {
        this.logger.warn(`Skipped event ${event.id} during full sync: ${err}`);
      }
    }

    return { synced };
  }

  // ── Token rotation: refresh if expiring within 5 minutes ─────────────────

  private async getRefreshedClient(user: User) {
    const encKey = this.config.getOrThrow<string>('GOOGLE_TOKEN_ENCRYPTION_KEY');
    const oauth2Client = this.googleAuth.createOAuth2Client();

    const accessToken = decrypt(user.googleAccessToken!, encKey);
    const refreshToken = decrypt(user.googleRefreshToken!, encKey);

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    // Rotate if token expires in < 5 minutes or is already expired
    const fiveMinutes = 5 * 60 * 1000;
    const needsRefresh =
      !user.googleTokenExpiry ||
      user.googleTokenExpiry.getTime() < Date.now() + fiveMinutes;

    if (needsRefresh) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      // Persist the new access token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...(credentials.access_token && {
            googleAccessToken: encrypt(credentials.access_token, encKey),
          }),
          ...(credentials.expiry_date && {
            googleTokenExpiry: new Date(credentials.expiry_date),
          }),
        },
      });
      oauth2Client.setCredentials(credentials);
    }

    return oauth2Client;
  }

  // ── Map KidSchedule event → Google Calendar resource ─────────────────────

  private mapToGoogleEvent(event: EventWithChildren) {
    const childNames = event.children.map((ec) => ec.child.firstName).join(', ');
    const description = [
      childNames ? `Children: ${childNames}` : null,
      event.notes ?? null,
      `\n— Synced from KidSchedule`,
    ]
      .filter(Boolean)
      .join('\n');

    if (event.allDay) {
      const dateStr = event.startAt.toISOString().slice(0, 10);
      const endDateStr = new Date(event.endAt.getTime() + 86400000)
        .toISOString()
        .slice(0, 10);
      return {
        summary: event.title,
        description,
        colorId: EVENT_TYPE_COLOR[event.type] ?? '1',
        start: { date: dateStr },
        end: { date: endDateStr },
      };
    }

    return {
      summary: event.title,
      description,
      colorId: EVENT_TYPE_COLOR[event.type] ?? '1',
      start: { dateTime: event.startAt.toISOString() },
      end: { dateTime: event.endAt.toISOString() },
    };
  }
}
