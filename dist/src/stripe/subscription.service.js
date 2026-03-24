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
exports.SubscriptionService = exports.FREE_MOMENTS_LIMIT = exports.FEATURE_PLAN = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PLAN_ORDER = {
    FREE: 0,
    ESSENTIAL: 1,
    PLUS: 2,
    COMPLETE: 3,
};
exports.FEATURE_PLAN = {
    multi_child: 'PLUS',
    ai_mediation: 'PLUS',
    ai_calendar_import: 'PLUS',
    google_calendar: 'PLUS',
    caregiver_portal: 'ESSENTIAL',
    organizations: 'ESSENTIAL',
    change_requests: 'ESSENTIAL',
    moments_unlimited: 'PLUS',
};
exports.FREE_MOMENTS_LIMIT = 5;
let SubscriptionService = class SubscriptionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEffectivePlan(userId) {
        const ownSub = await this.prisma.subscription.findUnique({ where: { userId } });
        let best = ownSub?.plan ?? 'FREE';
        const memberships = await this.prisma.familyMember.findMany({
            where: { userId },
            select: { familyId: true },
        });
        if (memberships.length === 0)
            return best;
        const familyIds = memberships.map((m) => m.familyId);
        const coMembers = await this.prisma.familyMember.findMany({
            where: { familyId: { in: familyIds }, userId: { not: userId } },
            select: { userId: true },
        });
        if (coMembers.length === 0)
            return best;
        const coSubs = await this.prisma.subscription.findMany({
            where: { userId: { in: coMembers.map((m) => m.userId) } },
            select: { plan: true },
        });
        for (const sub of coSubs) {
            if (PLAN_ORDER[sub.plan] > PLAN_ORDER[best]) {
                best = sub.plan;
            }
        }
        return best;
    }
    async hasFeature(userId, feature) {
        const requiredPlan = exports.FEATURE_PLAN[feature];
        if (!requiredPlan)
            return true;
        const effectivePlan = await this.getEffectivePlan(userId);
        return PLAN_ORDER[effectivePlan] >= PLAN_ORDER[requiredPlan];
    }
    async getFullSubscription(userId) {
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        const effectivePlan = await this.getEffectivePlan(userId);
        const ownPlan = sub?.plan ?? 'FREE';
        const inheritedFromFamily = PLAN_ORDER[effectivePlan] > PLAN_ORDER[ownPlan];
        return {
            plan: effectivePlan,
            ownPlan,
            inheritedFromFamily,
            billingType: sub?.billingType ?? 'INDIVIDUAL',
            currentPeriodEnd: sub?.currentPeriodEnd ?? null,
            cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
        };
    }
    async getMomentsCount(familyId) {
        return this.prisma.moment.count({ where: { familyId } });
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map