import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlanType } from '@prisma/client';
import { SubscriptionService } from './subscription.service';
export declare const RequirePlan: (plan: PlanType) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequireFeature: (feature: string) => import("@nestjs/common").CustomDecorator<string>;
export declare class SubscriptionGuard implements CanActivate {
    private reflector;
    private subService;
    constructor(reflector: Reflector, subService: SubscriptionService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
