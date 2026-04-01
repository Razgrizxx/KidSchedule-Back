import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType, BillingType, Subscription as PrismaSubscription } from '@prisma/client';

// Map priceId → plan + billing type
const PRICE_PLAN_MAP: Record<string, { plan: PlanType; billingType: BillingType }> = {};

// Built at runtime from env
function buildPriceMap(config: ConfigService): Record<string, { plan: PlanType; billingType: BillingType }> {
  const map: Record<string, { plan: PlanType; billingType: BillingType }> = {};
  const entries: Array<[string, PlanType, BillingType]> = [
    ['STRIPE_PRICE_ESSENTIAL_INDIVIDUAL', 'ESSENTIAL', 'INDIVIDUAL'],
    ['STRIPE_PRICE_ESSENTIAL_FAMILY',     'ESSENTIAL', 'FAMILY'],
    ['STRIPE_PRICE_PLUS_INDIVIDUAL',      'PLUS',      'INDIVIDUAL'],
    ['STRIPE_PRICE_PLUS_FAMILY',          'PLUS',      'FAMILY'],
    ['STRIPE_PRICE_COMPLETE_INDIVIDUAL',  'COMPLETE',  'INDIVIDUAL'],
    ['STRIPE_PRICE_COMPLETE_FAMILY',      'COMPLETE',  'FAMILY'],
  ];
  for (const [envKey, plan, billingType] of entries) {
    const priceId = config.get<string>(envKey);
    if (priceId) map[priceId] = { plan, billingType };
  }
  return map;
}

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly priceMap: Record<string, { plan: PlanType; billingType: BillingType }>;
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
      success_url: `${appUrl}/#/dashboard/settings?checkout=success`,
      cancel_url: `${appUrl}/#/pricing?checkout=cancelled`,
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
      billingType: sub?.billingType ?? 'INDIVIDUAL',
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

    // subscription and customer may be expanded objects or plain IDs
    const subId = typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as Stripe.Subscription).id;
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : (session.customer as Stripe.Customer).id;

    const stripeSub = await this.stripe.subscriptions.retrieve(subId);
    const priceId = stripeSub.items.data[0]?.price.id;
    const planInfo = priceId ? this.priceMap[priceId] : undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEndTs: number | undefined = (stripeSub as any).current_period_end;
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

  private async handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (!sub) return;

    const priceId = stripeSub.items.data[0]?.price.id;
    const planInfo = priceId ? this.priceMap[priceId] : undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEndTs: number | undefined = (stripeSub as any).current_period_end;
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
