import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as twilio from 'twilio';
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
    private mailer: MailerService,
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
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailer.sendMail({
      to: user.email,
      subject: 'Reset your KidSchedule password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#66CCCC;">Reset your password</h2>
          <p>Hi ${user.firstName},</p>
          <p>You requested a password reset. Click below to set a new password — this link expires in <strong>1 hour</strong>.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" style="background:#66CCCC;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
              Reset Password
            </a>
          </p>
          <p style="color:#94a3b8;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

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

  private getTwilioClient() {
    const sid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.config.get<string>('TWILIO_AUTH_TOKEN');
    if (!sid || !token) return null;
    return twilio.default(sid, token);
  }

  async sendPhoneCode(userId: string, phone: string) {
    // Normalize to E.164: strip all non-digit chars, re-add leading +
    const digits = phone.replace(/\D/g, '');
    phone = (phone.trim().startsWith('+') ? '+' : '') + digits;

    const devMode = this.config.get<string>('DEV_MODE') === 'true';
    const serviceSid = this.config.get<string>('TWILIO_VERIFY_SERVICE_SID');
    const client = this.getTwilioClient();
    console.log(devMode, client, serviceSid);
    if (!devMode && client && serviceSid) {
      console.log('Using Twilio to send code');
      try {
        await client.verify.v2.services(serviceSid).verifications.create({
          to: phone,
          channel: 'sms',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Twilio error:', msg);
        throw new Error(`Twilio: ${msg}`);
      }
      return { message: 'Code sent' };
    }

    // Dev / no-Twilio fallback: store code in DB
    const code = devMode
      ? '123456'
      : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.phoneVerification.create({
      data: { userId, phone, code, expiresAt },
    });
    return { message: 'Code sent', ...(devMode && { code }) };
  }

  async verifyPhone(userId: string, phone: string, code: string) {
    const digits = phone.replace(/\D/g, '');
    phone = (phone.trim().startsWith('+') ? '+' : '') + digits;

    const devMode = this.config.get<string>('DEV_MODE') === 'true';
    const serviceSid = this.config.get<string>('TWILIO_VERIFY_SERVICE_SID');
    const client = this.getTwilioClient();

    if (devMode) {
      // Dev bypass: accept 123456 without any external call or DB lookup
      if (code !== '123456')
        throw new BadRequestException('Invalid or expired code');
    } else if (client && serviceSid) {
      const check = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: phone, code });
      if (check.status !== 'approved')
        throw new BadRequestException('Invalid or expired code');
    } else {
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
    isVerified: boolean;
  }) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  }
}
