import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlanType } from '@prisma/client';
import { SubscriptionService, FEATURE_PLAN } from './subscription.service';

/** Require a minimum plan level: @RequirePlan('PLUS') */
export const RequirePlan = (plan: PlanType) => SetMetadata('requiredPlan', plan);

/** Require a named feature: @RequireFeature('ai_mediation') */
export const RequireFeature = (feature: string) => SetMetadata('requiredFeature', feature);

const PLAN_ORDER: Record<PlanType, number> = {
  FREE: 0,
  ESSENTIAL: 1,
  PLUS: 2,
  COMPLETE: 3,
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<PlanType>('requiredPlan', [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredFeature = this.reflector.getAllAndOverride<string>('requiredFeature', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlan && !requiredFeature) return true;

    const request = context.switchToHttp().getRequest<{ user?: { id: string } }>();
    const userId = request.user?.id;
    if (!userId) throw new ForbiddenException('Authentication required');

    const effectivePlan = await this.subService.getEffectivePlan(userId);

    // Feature-based check
    if (requiredFeature) {
      const neededPlan = FEATURE_PLAN[requiredFeature];
      if (neededPlan && PLAN_ORDER[effectivePlan] < PLAN_ORDER[neededPlan]) {
        throw new ForbiddenException(
          `This feature requires the ${neededPlan} plan. Your current plan: ${effectivePlan}. Upgrade at /pricing.`,
        );
      }
    }

    // Direct plan-level check
    if (requiredPlan && PLAN_ORDER[effectivePlan] < PLAN_ORDER[requiredPlan]) {
      throw new ForbiddenException(
        `This feature requires the ${requiredPlan} plan. Your current plan: ${effectivePlan}. Upgrade at /pricing.`,
      );
    }

    return true;
  }
}
