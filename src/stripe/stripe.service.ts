import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType, BillingInterval, Subscription as PrismaSubscription } from '@prisma/client';

// Map priceId → plan + interval
const PRICE_PLAN_MAP: Record<string, { plan: PlanType; interval: BillingInterval }> = {};

// Built at runtime from env
function buildPriceMap(config: ConfigService): Record<string, { plan: PlanType; interval: BillingInterval }> {
  const map: Record<string, { plan: PlanType; interval: BillingInterval }> = {};
  const entries: Array<[string, PlanType, BillingInterval]> = [
    ['STRIPE_PRICE_ESSENTIAL_MONTHLY', 'ESSENTIAL', 'MONTHLY'],
    ['STRIPE_PRICE_ESSENTIAL_ANNUAL', 'ESSENTIAL', 'ANNUAL'],
    ['STRIPE_PRICE_PLUS_MONTHLY', 'PLUS', 'MONTHLY'],
    ['STRIPE_PRICE_PLUS_ANNUAL', 'PLUS', 'ANNUAL'],
    ['STRIPE_PRICE_COMPLETE_MONTHLY', 'COMPLETE', 'MONTHLY'],
    ['STRIPE_PRICE_COMPLETE_ANNUAL', 'COMPLETE', 'ANNUAL'],
  ];
  for (const [envKey, plan, interval] of entries) {
    const priceId = config.get<string>(envKey);
    if (priceId) map[priceId] = { plan, interval };
  }
  return map;
}

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly priceMap: Record<string, { plan: PlanType; interval: BillingInterval }>;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'));
    this.webhookSecret = config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    this.priceMap = buildPriceMap(config);
  }

  // ── Checkout ───────────────────────────────────────────────────────────────

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { subscription: true },
    });

    // Reuse or create Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:5173');

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

  // ── Billing portal (manage/cancel) ─────────────────────────────────────────

  async createPortalSession(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) throw new BadRequestException('No active subscription');

    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:5173');
    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/dashboard/settings`,
    });

    return { url: session.url };
  }

  // ── Current subscription ────────────────────────────────────────────────────

  async getSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    return {
      plan: sub?.plan ?? 'FREE',
      billingInterval: sub?.billingInterval ?? 'MONTHLY',
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    };
  }

  // ── Webhook ────────────────────────────────────────────────────────────────

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(sub);
        break;
      }
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (session.mode !== 'subscription' || !session.subscription) return;

    const userId = session.metadata?.userId;
    if (!userId) return;

    const stripeSub = await this.stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = stripeSub.items.data[0]?.price.id;
    const planInfo = priceId ? this.priceMap[priceId] : undefined;
    const periodEnd = (stripeSub as unknown as { current_period_end: number }).current_period_end;

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: planInfo?.plan ?? 'ESSENTIAL',
        billingInterval: planInfo?.interval ?? 'MONTHLY',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: priceId,
        currentPeriodEnd: new Date(periodEnd * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
      update: {
        plan: planInfo?.plan ?? 'ESSENTIAL',
        billingInterval: planInfo?.interval ?? 'MONTHLY',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: priceId,
        currentPeriodEnd: new Date(periodEnd * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    });

    this.logger.log(`Subscription activated for user ${userId}: ${planInfo?.plan}`);
  }

  private async handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (!sub) return;

    const priceId = stripeSub.items.data[0]?.price.id;
    const planInfo = priceId ? this.priceMap[priceId] : undefined;
    const periodEnd = (stripeSub as unknown as { current_period_end: number }).current_period_end;

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        plan: planInfo?.plan ?? sub.plan,
        billingInterval: planInfo?.interval ?? sub.billingInterval,
        stripePriceId: priceId,
        currentPeriodEnd: new Date(periodEnd * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    });
  }

  private async handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
    const sub: PrismaSubscription | null = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (!sub) return;

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { plan: 'FREE', stripeSubscriptionId: null, stripePriceId: null, currentPeriodEnd: null },
    });
  }
}
