"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_util_1 = require("../google/crypto.util");
const AUTHORITY = 'https://login.microsoftonline.com/common/oauth2/v2.0';
const SCOPES = 'Calendars.ReadWrite offline_access openid';
let OutlookAuthService = class OutlookAuthService {
    prisma;
    config;
    jwt;
    constructor(prisma, config, jwt) {
        this.prisma = prisma;
        this.config = config;
        this.jwt = jwt;
    }
    getAuthUrl(userId) {
        const state = this.jwt.sign({ userId }, { expiresIn: '5m' });
        const params = new URLSearchParams({
            client_id: this.config.getOrThrow('OUTLOOK_CLIENT_ID'),
            response_type: 'code',
            redirect_uri: this.config.getOrThrow('OUTLOOK_REDIRECT_URI'),
            scope: SCOPES,
            response_mode: 'query',
            state,
        });
        return `${AUTHORITY}/authorize?${params.toString()}`;
    }
    verifyState(state) {
        try {
            const payload = this.jwt.verify(state);
            return payload.userId;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired OAuth state');
        }
    }
    async handleCallback(code, userId) {
        const body = new URLSearchParams({
            client_id: this.config.getOrThrow('OUTLOOK_CLIENT_ID'),
            client_secret: this.config.getOrThrow('OUTLOOK_CLIENT_SECRET'),
            code,
            redirect_uri: this.config.getOrThrow('OUTLOOK_REDIRECT_URI'),
            grant_type: 'authorization_code',
            scope: SCOPES,
        });
        const res = await fetch(`${AUTHORITY}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Outlook token exchange failed: ${err}`);
        }
        const tokens = (await res.json());
        const encKey = this.config.getOrThrow('OUTLOOK_TOKEN_ENCRYPTION_KEY');
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                outlookAccessToken: (0, crypto_util_1.encrypt)(tokens.access_token, encKey),
                ...(tokens.refresh_token && {
                    outlookRefreshToken: (0, crypto_util_1.encrypt)(tokens.refresh_token, encKey),
                }),
                outlookTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
            },
        });
    }
    async getValidAccessToken(userId) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { outlookAccessToken: true, outlookRefreshToken: true, outlookTokenExpiry: true },
        });
        const encKey = this.config.getOrThrow('OUTLOOK_TOKEN_ENCRYPTION_KEY');
        const fiveMinutes = 5 * 60 * 1000;
        const needsRefresh = !user.outlookTokenExpiry ||
            user.outlookTokenExpiry.getTime() < Date.now() + fiveMinutes;
        if (!needsRefresh && user.outlookAccessToken) {
            return (0, crypto_util_1.decrypt)(user.outlookAccessToken, encKey);
        }
        const body = new URLSearchParams({
            client_id: this.config.getOrThrow('OUTLOOK_CLIENT_ID'),
            client_secret: this.config.getOrThrow('OUTLOOK_CLIENT_SECRET'),
            refresh_token: (0, crypto_util_1.decrypt)(user.outlookRefreshToken, encKey),
            grant_type: 'refresh_token',
            scope: SCOPES,
        });
        const res = await fetch(`${AUTHORITY}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        if (!res.ok)
            throw new Error('Failed to refresh Outlook token');
        const tokens = (await res.json());
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                outlookAccessToken: (0, crypto_util_1.encrypt)(tokens.access_token, encKey),
                ...(tokens.refresh_token && {
                    outlookRefreshToken: (0, crypto_util_1.encrypt)(tokens.refresh_token, encKey),
                }),
                outlookTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
            },
        });
        return tokens.access_token;
    }
    async getStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { outlookRefreshToken: true },
        });
        return { connected: !!user?.outlookRefreshToken };
    }
    async disconnect(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                outlookAccessToken: null,
                outlookRefreshToken: null,
                outlookTokenExpiry: null,
                outlookCalendarId: null,
            },
        });
        return { message: 'Outlook Calendar disconnected' };
    }
};
exports.OutlookAuthService = OutlookAuthService;
exports.OutlookAuthService = OutlookAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        jwt_1.JwtService])
], OutlookAuthService);
//# sourceMappingURL=outlook-auth.service.js.map