import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';

export interface PushPayload {
  title: string;
  body: string;
  /** Extra key/value data sent alongside the notification */
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private app: admin.app.App | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const projectId   = this.config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey  = this.config.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials not configured — push notifications disabled. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env',
      );
      return;
    }

    // Avoid re-initialising on hot reload
    if (admin.apps.length === 0) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // Env vars encode newlines as literal \n — replace them
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      this.app = admin.apps[0]!;
    }

    this.logger.log('Firebase Admin initialised — push notifications enabled');
  }

  /** Send a push notification to every device registered by a user. */
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.app) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });

    const tokens = user?.fcmTokens ?? [];
    if (tokens.length === 0) return;

    await this.dispatchMulticast(tokens, userId, payload);
  }

  /**
   * Send a push notification to all family members except the actor
   * (the person who triggered the event — they don't need a notification).
   */
  async sendToFamily(
    familyId: string,
    excludeUserId: string,
    payload: PushPayload,
  ): Promise<void> {
    if (!this.app) return;

    const members = await this.prisma.familyMember.findMany({
      where: { familyId, userId: { not: excludeUserId } },
      include: { user: { select: { id: true, fcmTokens: true } } },
    });

    const allTokens: string[] = members.flatMap((m) => m.user.fcmTokens);
    if (allTokens.length === 0) return;

    // Group tokens by user so we can prune invalids per-user
    const tokenUserMap = new Map<string, string>();
    for (const m of members) {
      for (const t of m.user.fcmTokens) {
        tokenUserMap.set(t, m.user.id);
      }
    }

    await this.dispatchMulticast(allTokens, null, payload, tokenUserMap);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async dispatchMulticast(
    tokens: string[],
    singleUserId: string | null,
    payload: PushPayload,
    tokenUserMap?: Map<string, string>,
  ): Promise<void> {
    const messaging = admin.messaging(this.app!);

    // FCM multicast accepts up to 500 tokens per call
    const chunks = this.chunk(tokens, 500);

    for (const chunk of chunks) {
      try {
        const response = await messaging.sendEachForMulticast({
          tokens: chunk,
          notification: { title: payload.title, body: payload.body },
          data: payload.data ?? {},
          webpush: {
            notification: {
              title: payload.title,
              body: payload.body,
              icon: '/icons/icon-192.png',
              badge: '/icons/badge-72.png',
            },
            fcmOptions: { link: '/' },
          },
        });

        // Prune stale / invalid tokens so we don't keep sending to dead registrations
        const staleTokens: string[] = [];
        response.responses.forEach((res, idx) => {
          if (!res.success) {
            const code = res.error?.code;
            if (
              code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered'
            ) {
              staleTokens.push(chunk[idx]);
            }
          }
        });

        if (staleTokens.length > 0) {
          await this.pruneTokens(staleTokens, singleUserId, tokenUserMap);
        }
      } catch (err) {
        this.logger.error('FCM multicast error', err);
      }
    }
  }

  private async pruneTokens(
    stale: string[],
    singleUserId: string | null,
    tokenUserMap?: Map<string, string>,
  ): Promise<void> {
    if (singleUserId) {
      await this.prisma.user.update({
        where: { id: singleUserId },
        data: { fcmTokens: { set: await this.getFilteredTokens(singleUserId, stale) } },
      });
      return;
    }

    if (!tokenUserMap) return;

    // Group stale tokens by user
    const byUser = new Map<string, string[]>();
    for (const t of stale) {
      const uid = tokenUserMap.get(t);
      if (uid) {
        const arr = byUser.get(uid) ?? [];
        arr.push(t);
        byUser.set(uid, arr);
      }
    }

    for (const [uid, staleForUser] of byUser) {
      await this.prisma.user.update({
        where: { id: uid },
        data: { fcmTokens: { set: await this.getFilteredTokens(uid, staleForUser) } },
      });
    }
  }

  private async getFilteredTokens(
    userId: string,
    stale: string[],
  ): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });
    const staleSet = new Set(stale);
    return (user?.fcmTokens ?? []).filter((t) => !staleSet.has(t));
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}
