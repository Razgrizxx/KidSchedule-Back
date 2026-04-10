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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const admin = __importStar(require("firebase-admin"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    config;
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    app = null;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
    }
    onModuleInit() {
        const projectId = this.config.get('FIREBASE_PROJECT_ID');
        const clientEmail = this.config.get('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.config.get('FIREBASE_PRIVATE_KEY');
        if (!projectId || !clientEmail || !privateKey) {
            this.logger.warn('Firebase credentials not configured — push notifications disabled. ' +
                'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
            return;
        }
        try {
            if (admin.apps.length === 0) {
                const normalizedKey = privateKey
                    .replace(/\\n/g, '\n')
                    .replace(/^["']|["']$/g, '');
                this.app = admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey: normalizedKey,
                    }),
                });
            }
            else {
                this.app = admin.apps[0];
            }
            this.logger.log('Firebase Admin initialised — push notifications enabled');
        }
        catch (err) {
            this.logger.warn(`Firebase Admin failed to initialise — push notifications disabled. ` +
                `Check that FIREBASE_PRIVATE_KEY is the full PEM key from your service account JSON. ` +
                `Error: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    async sendToUser(userId, payload) {
        if (!this.app)
            return;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fcmTokens: true },
        });
        const tokens = user?.fcmTokens ?? [];
        if (tokens.length === 0)
            return;
        await this.dispatchMulticast(tokens, userId, payload);
    }
    async sendToFamily(familyId, excludeUserId, payload) {
        if (!this.app)
            return;
        const members = await this.prisma.familyMember.findMany({
            where: { familyId, userId: { not: excludeUserId } },
            include: { user: { select: { id: true, fcmTokens: true } } },
        });
        const allTokens = members.flatMap((m) => m.user.fcmTokens);
        if (allTokens.length === 0)
            return;
        const tokenUserMap = new Map();
        for (const m of members) {
            for (const t of m.user.fcmTokens) {
                tokenUserMap.set(t, m.user.id);
            }
        }
        await this.dispatchMulticast(allTokens, null, payload, tokenUserMap);
    }
    async dispatchMulticast(tokens, singleUserId, payload, tokenUserMap) {
        const messaging = admin.messaging(this.app);
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
                const staleTokens = [];
                response.responses.forEach((res, idx) => {
                    if (!res.success) {
                        const code = res.error?.code;
                        if (code === 'messaging/invalid-registration-token' ||
                            code === 'messaging/registration-token-not-registered') {
                            staleTokens.push(chunk[idx]);
                        }
                    }
                });
                if (staleTokens.length > 0) {
                    await this.pruneTokens(staleTokens, singleUserId, tokenUserMap);
                }
            }
            catch (err) {
                this.logger.error('FCM multicast error', err);
            }
        }
    }
    async pruneTokens(stale, singleUserId, tokenUserMap) {
        if (singleUserId) {
            await this.prisma.user.update({
                where: { id: singleUserId },
                data: { fcmTokens: { set: await this.getFilteredTokens(singleUserId, stale) } },
            });
            return;
        }
        if (!tokenUserMap)
            return;
        const byUser = new Map();
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
    async getFilteredTokens(userId, stale) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fcmTokens: true },
        });
        const staleSet = new Set(stale);
        return (user?.fcmTokens ?? []).filter((t) => !staleSet.has(t));
    }
    chunk(arr, size) {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map