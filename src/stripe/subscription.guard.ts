import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '@prisma/client';

export const RequirePlan = (plan: PlanType) => SetMetadata('requiredPlan', plan);

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
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<PlanType>('requiredPlan', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlan) return true;

    const request = context.switchToHttp().getRequest<{ user?: { id: string } }>();
    const userId = request.user?.id;
    if (!userId) throw new ForbiddenException('Authentication required');

    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    const currentPlan = sub?.plan ?? 'FREE';

    if (PLAN_ORDER[currentPlan] < PLAN_ORDER[requiredPlan]) {
      throw new ForbiddenException(
        `This feature requires the ${requiredPlan} plan or higher. Upgrade at /pricing.`,
      );
    }

    return true;
  }
}
