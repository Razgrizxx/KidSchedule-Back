import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Vonage } from '@vonage/server-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        familyMemberships: {
          create: {
            role: 'PARENT',
            family: {
              create: { name: `Family of ${dto.firstName}` },
            },
          },
        },
      },
    });

    void this.mail.sendWelcomeEmail(user.email, user.firstName).catch(() => {});

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return same response to prevent user enumeration
    const response = {
      message: 'If that email is registered, a reset link has been sent.',
    };

    if (!user) return response;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    const resetUrl = `${frontendUrl}/#/reset-password?token=${token}`;

    await this.mail.sendPasswordReset(user.email, user.firstName, resetUrl);

    return response;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password updated successfully. You can now log in.' };
  }

  private getVonageClient() {
    const apiKey = this.config.get<string>('VONAGE_API_KEY');
    const apiSecret = this.config.get<string>('VONAGE_API_SECRET');
    if (!apiKey || !apiSecret) return null;
    return new Vonage({ apiKey, apiSecret });
  }

  private normalizePhone(phone: string): string {
    const hasPlus = phone.trim().startsWith('+');
    const digits = phone.replace(/\D/g, '');

    if (hasPlus) return `+${digits}`;

    // Argentine mobile: 10 digits starting with 11/2x/3x = area code + 8-digit number
    // Add +549 prefix (9 = mobile indicator required by Twilio for AR)
    if (digits.length === 10) return `+549${digits}`;

    // Already has country code without +
    return `+${digits}`;
  }

  async sendPhoneCode(userId: string, phone: string) {
    phone = this.normalizePhone(phone);

    // Clean up old verification attempts for this user
    await this.prisma.phoneVerification.deleteMany({ where: { userId } });

    const devMode = this.config.get<string>('DEV_MODE') === 'true';
    const code = devMode
      ? '123456'
      : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.phoneVerification.create({
      data: { userId, phone, code, expiresAt },
    });

    if (!devMode) {
      const vonage = this.getVonageClient();
      if (!vonage) throw new Error('SMS provider not configured');
      try {
        await vonage.sms.send({
          to: phone,
          from: 'KidSchedule',
          text: `Your KidSchedule verification code is: ${code}. Valid for 10 minutes.`,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`SMS error: ${msg}`);
      }
    }

    return { message: 'Code sent', ...(devMode && { code }) };
  }

  async verifyPhone(userId: string, phone: string, code: string) {
    phone = this.normalizePhone(phone);

    const devMode = this.config.get<string>('DEV_MODE') === 'true';

    if (devMode && code !== '123456') {
      throw new BadRequestException('Invalid or expired code');
    } else if (!devMode) {
      const record = await this.prisma.phoneVerification.findFirst({
        where: {
          userId,
          phone,
          code,
          verified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (!record) throw new BadRequestException('Invalid or expired code');
      await this.prisma.phoneVerification.update({
        where: { id: record.id },
        data: { verified: true },
      });
    }

    // If phone is stored under a different format for this user, clear it first
    await this.prisma.user.updateMany({
      where: { phone, NOT: { id: userId } },
      data: { phone: null, isVerified: false },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { phone, isVerified: true },
    });

    return { message: 'Phone verified successfully' };
  }

  private signToken(user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    isVerified: boolean;
    avatarUrl?: string | null;
  }) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? null,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl ?? null,
      },
    };
  }
}
