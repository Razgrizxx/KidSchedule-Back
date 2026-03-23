"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionGuard = exports.RequireFeature = exports.RequirePlan = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const subscription_service_1 = require("./subscription.service");
const RequirePlan = (plan) => (0, common_1.SetMetadata)('requiredPlan', plan);
exports.RequirePlan = RequirePlan;
const RequireFeature = (feature) => (0, common_1.SetMetadata)('requiredFeature', feature);
exports.RequireFeature = RequireFeature;
const PLAN_ORDER = {
    FREE: 0,
    ESSENTIAL: 1,
    PLUS: 2,
    COMPLETE: 3,
};
let SubscriptionGuard = class SubscriptionGuard {
    reflector;
    subService;
    constructor(reflector, subService) {
        this.reflector = reflector;
        this.subService = subService;
    }
    async canActivate(context) {
        const requiredPlan = this.reflector.getAllAndOverride('requiredPlan', [
            context.getHandler(),
            context.getClass(),
        ]);
        const requiredFeature = this.reflector.getAllAndOverride('requiredFeature', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPlan && !requiredFeature)
            return true;
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        if (!userId)
            throw new common_1.ForbiddenException('Authentication required');
        const effectivePlan = await this.subService.getEffectivePlan(userId);
        if (requiredFeature) {
            const neededPlan = subscription_service_1.FEATURE_PLAN[requiredFeature];
            if (neededPlan && PLAN_ORDER[effectivePlan] < PLAN_ORDER[neededPlan]) {
                throw new common_1.ForbiddenException(`This feature requires the ${neededPlan} plan. Your current plan: ${effectivePlan}. Upgrade at /pricing.`);
            }
        }
        if (requiredPlan && PLAN_ORDER[effectivePlan] < PLAN_ORDER[requiredPlan]) {
            throw new common_1.ForbiddenException(`This feature requires the ${requiredPlan} plan. Your current plan: ${effectivePlan}. Upgrade at /pricing.`);
        }
        return true;
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        subscription_service_1.SubscriptionService])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map