import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt, decrypt } from '../google/crypto.util';

const AUTHORITY = 'https://login.microsoftonline.com/common/oauth2/v2.0';
const SCOPES    = 'Calendars.ReadWrite offline_access openid';

@Injectable()
export class OutlookAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  // ── Step 1: Build the Microsoft OAuth URL ────────────────────────────────

  getAuthUrl(userId: string): string {
    const state = this.jwt.sign({ userId }, { expiresIn: '5m' });
    const params = new URLSearchParams({
      client_id:     this.config.getOrThrow<string>('OUTLOOK_CLIENT_ID'),
      response_type: 'code',
      redirect_uri:  this.config.getOrThrow<string>('OUTLOOK_REDIRECT_URI'),
      scope:         SCOPES,
      response_mode: 'query',
      state,
    });
    return `${AUTHORITY}/authorize?${params.toString()}`;
  }

  // ── Step 2: Verify state JWT (OAuth callback) ─────────────────────────────

  verifyState(state: string): string {
    try {
      const payload = this.jwt.verify<{ userId: string }>(state);
      return payload.userId;
    } catch {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
  }

  // ── Step 3: Exchange code for tokens and persist them ────────────────────

  async handleCallback(code: string, userId: string): Promise<void> {
    const body = new URLSearchParams({
      client_id:     this.config.getOrThrow<string>('OUTLOOK_CLIENT_ID'),
      client_secret: this.config.getOrThrow<string>('OUTLOOK_CLIENT_SECRET'),
      code,
      redirect_uri:  this.config.getOrThrow<string>('OUTLOOK_REDIRECT_URI'),
      grant_type:    'authorization_code',
      scope:         SCOPES,
    });

    const res = await fetch(`${AUTHORITY}/token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Outlook token exchange failed: ${err}`);
    }

    const tokens = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    const encKey = this.config.getOrThrow<string>('OUTLOOK_TOKEN_ENCRYPTION_KEY');
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        outlookAccessToken:  encrypt(tokens.access_token, encKey),
        ...(tokens.refresh_token && {
          outlookRefreshToken: encrypt(tokens.refresh_token, encKey),
        }),
        outlookTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });
  }

  // ── Refresh access token (5-minute buffer) ────────────────────────────────

  async getValidAccessToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where:  { id: userId },
      select: { outlookAccessToken: true, outlookRefreshToken: true, outlookTokenExpiry: true },
    });

    const encKey      = this.config.getOrThrow<string>('OUTLOOK_TOKEN_ENCRYPTION_KEY');
    const fiveMinutes = 5 * 60 * 1000;
    const needsRefresh =
      !user.outlookTokenExpiry ||
      user.outlookTokenExpiry.getTime() < Date.now() + fiveMinutes;

    if (!needsRefresh && user.outlookAccessToken) {
      return decrypt(user.outlookAccessToken, encKey);
    }

    // Refresh
    const body = new URLSearchParams({
      client_id:     this.config.getOrThrow<string>('OUTLOOK_CLIENT_ID'),
      client_secret: this.config.getOrThrow<string>('OUTLOOK_CLIENT_SECRET'),
      refresh_token: decrypt(user.outlookRefreshToken!, encKey),
      grant_type:    'refresh_token',
      scope:         SCOPES,
    });

    const res = await fetch(`${AUTHORITY}/token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });

    if (!res.ok) throw new Error('Failed to refresh Outlook token');

    const tokens = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        outlookAccessToken: encrypt(tokens.access_token, encKey),
        ...(tokens.refresh_token && {
          outlookRefreshToken: encrypt(tokens.refresh_token, encKey),
        }),
        outlookTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    return tokens.access_token;
  }

  // ── Status ────────────────────────────────────────────────────────────────

  async getStatus(userId: string): Promise<{ connected: boolean }> {
    const user = await this.prisma.user.findUnique({
      where:  { id: userId },
      select: { outlookRefreshToken: true },
    });
    return { connected: !!user?.outlookRefreshToken };
  }

  // ── Disconnect ────────────────────────────────────────────────────────────

  async disconnect(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        outlookAccessToken:  null,
        outlookRefreshToken: null,
        outlookTokenExpiry:  null,
        outlookCalendarId:   null,
      },
    });
    return { message: 'Outlook Calendar disconnected' };
  }
}
