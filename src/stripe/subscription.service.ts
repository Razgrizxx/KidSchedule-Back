import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '@prisma/client';

const PLAN_ORDER: Record<PlanType, number> = {
  FREE: 0,
  ESSENTIAL: 1,
  PLUS: 2,
  COMPLETE: 3,
};

// Which plan is required to use each feature
export const FEATURE_PLAN: Record<string, PlanType> = {
  multi_child:          'PLUS',      // 2nd+ child profile
  ai_mediation:         'PLUS',      // AI mediator
  ai_calendar_import:   'PLUS',      // AI calendar import
  google_calendar:      'PLUS',      // Google Calendar sync
  caregiver_portal:     'ESSENTIAL', // Caregiver portal
  organizations:        'ESSENTIAL', // Groups / Teams / Schools
  change_requests:      'ESSENTIAL', // Custody change requests
  moments_unlimited:    'PLUS',      // > 5 moments (FREE cap)
};

export const FREE_MOMENTS_LIMIT = 5;

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns the highest plan across the user AND all members of their families.
   * This implements the "Full Family" benefit: if any co-parent pays for Plus,
   * both parents enjoy Plus features.
   */
  async getEffectivePlan(userId: string): Promise<PlanType> {
    // 1. Own subscription
    const ownSub = await this.prisma.subscription.findUnique({ where: { userId } });
    let best: PlanType = ownSub?.plan ?? 'FREE';

    // 2. Find all families the user belongs to
    const memberships = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });

    if (memberships.length === 0) return best;

    // 3. Find all co-members in those families
    const familyIds = memberships.map((m) => m.familyId);
    const coMembers = await this.prisma.familyMember.findMany({
      where: { familyId: { in: familyIds }, userId: { not: userId } },
      select: { userId: true },
    });

    if (coMembers.length === 0) return best;

    // 4. Get their subscriptions and take the highest plan
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

  async hasFeature(userId: string, feature: string): Promise<boolean> {
    const requiredPlan = FEATURE_PLAN[feature];
    if (!requiredPlan) return true; // unknown feature = unrestricted

    const effectivePlan = await this.getEffectivePlan(userId);
    return PLAN_ORDER[effectivePlan] >= PLAN_ORDER[requiredPlan];
  }

  /** Returns full subscription info with effective plan for the frontend */
  async getFullSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    const effectivePlan = await this.getEffectivePlan(userId);
    const ownPlan: PlanType = sub?.plan ?? 'FREE';
    const inheritedFromFamily = PLAN_ORDER[effectivePlan] > PLAN_ORDER[ownPlan];

    return {
      plan: effectivePlan,
      ownPlan,
      inheritedFromFamily,
      billingInterval: sub?.billingInterval ?? 'MONTHLY',
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    };
  }

  async getMomentsCount(familyId: string): Promise<number> {
    return this.prisma.moment.count({ where: { familyId } });
  }
}
