import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '@prisma/client';
export declare const FEATURE_PLAN: Record<string, PlanType>;
export declare const FREE_MOMENTS_LIMIT = 5;
export declare class SubscriptionService {
    private prisma;
    constructor(prisma: PrismaService);
    getEffectivePlan(userId: string): Promise<PlanType>;
    hasFeature(userId: string, feature: string): Promise<boolean>;
    getFullSubscription(userId: string): Promise<{
        plan: import("@prisma/client").$Enums.PlanType;
        ownPlan: import("@prisma/client").$Enums.PlanType;
        inheritedFromFamily: boolean;
        billingType: import("@prisma/client").$Enums.BillingType;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
    }>;
    getMomentsCount(familyId: string): Promise<number>;
}
