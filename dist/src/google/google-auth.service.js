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
exports.GoogleAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const googleapis_1 = require("googleapis");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_util_1 = require("./crypto.util");
let GoogleAuthService = class GoogleAuthService {
    prisma;
    config;
    jwt;
    constructor(prisma, config, jwt) {
        this.prisma = prisma;
        this.config = config;
        this.jwt = jwt;
    }
    createOAuth2Client() {
        return new googleapis_1.google.auth.OAuth2(this.config.getOrThrow('GOOGLE_CLIENT_ID'), this.config.getOrThrow('GOOGLE_CLIENT_SECRET'), this.config.getOrThrow('GOOGLE_REDIRECT_URI'));
    }
    getAuthUrl(userId) {
        const state = this.jwt.sign({ userId }, { expiresIn: '5m' });
        return this.createOAuth2Client().generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: ['https://www.googleapis.com/auth/calendar'],
            state,
        });
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
        const oauth2Client = this.createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        const encKey = this.config.getOrThrow('GOOGLE_TOKEN_ENCRYPTION_KEY');
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(tokens.access_token && {
                    googleAccessToken: (0, crypto_util_1.encrypt)(tokens.access_token, encKey),
                }),
                ...(tokens.refresh_token && {
                    googleRefreshToken: (0, crypto_util_1.encrypt)(tokens.refresh_token, encKey),
                }),
                ...(tokens.expiry_date && {
                    googleTokenExpiry: new Date(tokens.expiry_date),
                }),
            },
        });
    }
    async disconnect(userId) {
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
    async getStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { googleRefreshToken: true },
        });
        return { connected: !!user?.googleRefreshToken };
    }
};
exports.GoogleAuthService = GoogleAuthService;
exports.GoogleAuthService = GoogleAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        jwt_1.JwtService])
], GoogleAuthService);
//# sourceMappingURL=google-auth.service.js.map