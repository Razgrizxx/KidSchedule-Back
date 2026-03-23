import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '@prisma/client';
export declare const RequirePlan: (plan: PlanType) => import("@nestjs/common").CustomDecorator<string>;
export declare class SubscriptionGuard implements CanActivate {
    private reflector;
    private prisma;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
