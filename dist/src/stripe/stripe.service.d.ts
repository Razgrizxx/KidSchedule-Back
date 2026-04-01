import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class StripeService {
    private config;
    private prisma;
    private readonly stripe;
    private readonly webhookSecret;
    private readonly priceMap;
    private readonly logger;
    constructor(config: ConfigService, prisma: PrismaService);
    createCheckoutSession(userId: string, priceId: string): Promise<{
        url: string | null;
    }>;
    createPortalSession(userId: string): Promise<{
        url: string;
    }>;
    getSubscription(userId: string): Promise<{
        plan: import("@prisma/client").$Enums.PlanType;
        billingType: import("@prisma/client").$Enums.BillingType;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
    }>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
    private handleCheckoutCompleted;
    private handleSubscriptionUpdated;
    activateFromSession(sessionId: string, userId: string): Promise<{
        activated: boolean;
    }>;
    private handleSubscriptionDeleted;
}
