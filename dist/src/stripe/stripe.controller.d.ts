import { StripeService } from './stripe.service';
import { SubscriptionService } from './subscription.service';
import { CreateCheckoutDto } from './dto/stripe.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class StripeController {
    private stripeService;
    private subService;
    constructor(stripeService: StripeService, subService: SubscriptionService);
    webhook(req: any, sig: string): Promise<{
        received: boolean;
    }>;
    checkout(user: AuthUser, dto: CreateCheckoutDto): Promise<{
        url: string | null;
    }>;
    portal(user: AuthUser): Promise<{
        url: string;
    }>;
    getSubscription(user: AuthUser): Promise<{
        plan: import("@prisma/client").$Enums.PlanType;
        ownPlan: import("@prisma/client").$Enums.PlanType;
        inheritedFromFamily: boolean;
        billingInterval: import("@prisma/client").$Enums.BillingInterval;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
    }>;
}
