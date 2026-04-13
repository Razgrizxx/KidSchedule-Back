import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { google, Auth } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt } from './crypto.util';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  // ── OAuth2 client factory ────────────────────────────────────────────────

  createOAuth2Client(): Auth.OAuth2Client {
    return new google.auth.OAuth2(
      this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      this.config.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  // ── Step 1: Generate the URL to send the user to ────────────────────────

  getAuthUrl(userId: string): string {
    // Embed userId in a short-lived JWT as the `state` param — stateless approach
    const state = this.jwt.sign({ userId }, { expiresIn: '5m' });

    return this.createOAuth2Client().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',           // Critical: ensures refresh_token is always returned
      scope: ['https://www.googleapis.com/auth/calendar'],
      state,
    });
  }

  // ── Step 2: Verify state JWT (callback) ─────────────────────────────────

  verifyState(state: string): string {
    try {
      const payload = this.jwt.verify<{ userId: string }>(state);
      return payload.userId;
    } catch {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
  }

  // ── Step 3: Exchange code for tokens and persist them ───────────────────

  async handleCallback(code: string, userId: string): Promise<{ familyIds: string[] }> {
    const oauth2Client = this.createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const encKey = this.config.getOrThrow<string>('GOOGLE_TOKEN_ENCRYPTION_KEY');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(tokens.access_token && {
          googleAccessToken: encrypt(tokens.access_token, encKey),
        }),
        // refresh_token is only present on first authorization (or after prompt:consent)
        ...(tokens.refresh_token && {
          googleRefreshToken: encrypt(tokens.refresh_token, encKey),
        }),
        ...(tokens.expiry_date && {
          googleTokenExpiry: new Date(tokens.expiry_date),
        }),
      },
    });

    const members = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });

    return { familyIds: members.map((m) => m.familyId) };
  }

  // ── Disconnect ───────────────────────────────────────────────────────────

  async disconnect(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleRefreshToken: null,
        googleAccessToken: null,
        googleTokenExpiry: null,
      },
    });
    return { message: 'Google Calendar disconnected' };
  }

  // ── Status ───────────────────────────────────────────────────────────────

  async getStatus(userId: string): Promise<{ connected: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googleRefreshToken: true },
    });
    return { connected: !!user?.googleRefreshToken };
  }
}
