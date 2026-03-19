"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mailer_1 = require("@nestjs-modules/mailer");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const twilio = __importStar(require("twilio"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    mailer;
    constructor(prisma, jwt, config, mailer) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.mailer = mailer;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.signToken(user);
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        const response = {
            message: 'If that email is registered, a reset link has been sent.',
        };
        if (!user)
            return response;
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expires,
            },
        });
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
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
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: dto.token,
                resetPasswordExpires: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired reset token');
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
    getTwilioClient() {
        const sid = this.config.get('TWILIO_ACCOUNT_SID');
        const token = this.config.get('TWILIO_AUTH_TOKEN');
        if (!sid || !token)
            return null;
        return twilio.default(sid, token);
    }
    async sendPhoneCode(userId, phone) {
        const devMode = this.config.get('DEV_MODE') === 'true';
        const serviceSid = this.config.get('TWILIO_VERIFY_SERVICE_SID');
        const client = this.getTwilioClient();
        if (!devMode && client && serviceSid) {
            await client.verify.v2.services(serviceSid).verifications.create({
                to: phone,
                channel: 'sms',
            });
            return { message: 'Code sent' };
        }
        const code = devMode
            ? '123456'
            : Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.phoneVerification.create({
            data: { userId, phone, code, expiresAt },
        });
        return { message: 'Code sent', ...(devMode && { code }) };
    }
    async verifyPhone(userId, phone, code) {
        const devMode = this.config.get('DEV_MODE') === 'true';
        const serviceSid = this.config.get('TWILIO_VERIFY_SERVICE_SID');
        const client = this.getTwilioClient();
        if (!devMode && client && serviceSid) {
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phone, code });
            if (check.status !== 'approved')
                throw new common_1.BadRequestException('Invalid or expired code');
        }
        else {
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
            if (!record)
                throw new common_1.BadRequestException('Invalid or expired code');
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
    signToken(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mailer_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map