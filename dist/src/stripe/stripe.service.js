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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../prisma/prisma.service");
const PRICE_PLAN_MAP = {};
function buildPriceMap(config) {
    const map = {};
    const entries = [
        ['STRIPE_PRICE_ESSENTIAL_INDIVIDUAL', 'ESSENTIAL', 'INDIVIDUAL'],
        ['STRIPE_PRICE_ESSENTIAL_FAMILY', 'ESSENTIAL', 'FAMILY'],
        ['STRIPE_PRICE_PLUS_INDIVIDUAL', 'PLUS', 'INDIVIDUAL'],
        ['STRIPE_PRICE_PLUS_FAMILY', 'PLUS', 'FAMILY'],
        ['STRIPE_PRICE_COMPLETE_INDIVIDUAL', 'COMPLETE', 'INDIVIDUAL'],
        ['STRIPE_PRICE_COMPLETE_FAMILY', 'COMPLETE', 'FAMILY'],
    ];
    for (const [envKey, plan, billingType] of entries) {
        const priceId = config.get(envKey);
        if (priceId)
            map[priceId] = { plan, billingType };
    }
    return map;
}
let StripeService = StripeService_1 = class StripeService {
    config;
    prisma;
    stripe;
    webhookSecret;
    priceMap;
    logger = new common_1.Logger(StripeService_1.name);
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.stripe = new stripe_1.default(config.getOrThrow('STRIPE_SECRET_KEY'));
        this.webhookSecret = config.getOrThrow('STRIPE_WEBHOOK_SECRET');
        this.priceMap = buildPriceMap(config);
    }
    async createCheckoutSession(userId, priceId) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            include: { subscription: true },
        });
        let customerId = user.subscription?.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                metadata: { userId },
            });
            customerId = customer.id;
        }
        const appUrl = this.config.get('APP_URL', 'http://localhost:5173');
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${appUrl}/dashboard/settings?checkout=success`,
            cancel_url: `${appUrl}/pricing?checkout=cancelled`,
            allow_promotion_codes: true,
            metadata: { userId },
        });
        return { url: session.url };
    }
    async createPortalSession(userId) {
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (!sub?.stripeCustomerId)
            throw new common_1.BadRequestException('No active subscription');
        const appUrl = this.config.get('APP_URL', 'http://localhost:5173');
        const session = await this.stripe.billingPortal.sessions.create({
            customer: sub.stripeCustomerId,
            return_url: `${appUrl}/dashboard/settings`,
        });
        return { url: session.url };
    }
    async getSubscription(userId) {
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        return {
            plan: sub?.plan ?? 'FREE',
            billingType: sub?.billingType ?? 'INDIVIDUAL',
            currentPeriodEnd: sub?.currentPeriodEnd ?? null,
            cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
        };
    }
    async handleWebhook(rawBody, signature) {
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
        }
        catch (err) {
            this.logger.error('Webhook signature verification failed', err);
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await this.handleCheckoutCompleted(session);
                break;
            }
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                await this.handleSubscriptionUpdated(sub);
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                await this.handleSubscriptionDeleted(sub);
                break;
            }
        }
        return { received: true };
    }
    async handleCheckoutCompleted(session) {
        if (session.mode !== 'subscription' || !session.subscription)
            return;
        const userId = session.metadata?.userId;
        if (!userId)
            return;
        const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;
        const customerId = typeof session.customer === 'string'
            ? session.customer
            : session.customer.id;
        const stripeSub = await this.stripe.subscriptions.retrieve(subId);
        const priceId = stripeSub.items.data[0]?.price.id;
        const planInfo = priceId ? this.priceMap[priceId] : undefined;
        const periodEndTs = stripeSub.current_period_end;
        const periodEnd = periodEndTs ? new Date(periodEndTs * 1000) : null;
        this.logger.log(`Checkout completed for user ${userId}, priceId=${priceId}, plan=${planInfo?.plan}`);
        await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                plan: planInfo?.plan ?? 'ESSENTIAL',
                billingType: planInfo?.billingType ?? 'INDIVIDUAL',
                stripeCustomerId: customerId,
                stripeSubscriptionId: stripeSub.id,
                stripePriceId: priceId,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            },
            update: {
                plan: planInfo?.plan ?? 'ESSENTIAL',
                billingType: planInfo?.billingType ?? 'INDIVIDUAL',
                stripeCustomerId: customerId,
                stripeSubscriptionId: stripeSub.id,
                stripePriceId: priceId,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            },
        });
        this.logger.log(`Subscription activated for user ${userId}: ${planInfo?.plan}`);
    }
    async handleSubscriptionUpdated(stripeSub) {
        const sub = await this.prisma.subscription.findUnique({
            where: { stripeSubscriptionId: stripeSub.id },
        });
        if (!sub)
            return;
        const priceId = stripeSub.items.data[0]?.price.id;
        const planInfo = priceId ? this.priceMap[priceId] : undefined;
        const periodEndTs = stripeSub.current_period_end;
        const periodEnd = periodEndTs ? new Date(periodEndTs * 1000) : null;
        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
                plan: planInfo?.plan ?? sub.plan,
                billingType: planInfo?.billingType ?? sub.billingType,
                stripePriceId: priceId,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            },
        });
    }
    async handleSubscriptionDeleted(stripeSub) {
        const sub = await this.prisma.subscription.findUnique({
            where: { stripeSubscriptionId: stripeSub.id },
        });
        if (!sub)
            return;
        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { plan: 'FREE', stripeSubscriptionId: null, stripePriceId: null, currentPeriodEnd: null },
        });
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map