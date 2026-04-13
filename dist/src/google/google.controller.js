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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GoogleController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const google_auth_service_1 = require("./google-auth.service");
const google_calendar_sync_service_1 = require("./google-calendar-sync.service");
const subscription_guard_1 = require("../stripe/subscription.guard");
let GoogleController = GoogleController_1 = class GoogleController {
    googleAuth;
    googleSync;
    config;
    logger = new common_1.Logger(GoogleController_1.name);
    constructor(googleAuth, googleSync, config) {
        this.googleAuth = googleAuth;
        this.googleSync = googleSync;
        this.config = config;
    }
    getAuthUrl(user) {
        return { url: this.googleAuth.getAuthUrl(user.id) };
    }
    async callback(code, state, error, res) {
        const appUrl = this.config.get('APP_URL', 'http://localhost:5173');
        const redirectBase = `${appUrl}/#/dashboard/settings`;
        if (error || !code) {
            return res.redirect(`${redirectBase}?google=error`);
        }
        try {
            const userId = this.googleAuth.verifyState(state);
            this.logger.log(`Google callback — userId: ${userId}`);
            const { familyIds } = await this.googleAuth.handleCallback(code, userId);
            this.logger.log(`Google callback — familyIds: ${familyIds.join(', ')}`);
            for (const familyId of familyIds) {
                void this.googleSync.syncAllEvents(familyId, userId).catch((err) => this.logger.error(`Initial Google sync failed for family ${familyId}`, err));
            }
            return res.redirect(`${redirectBase}?google=connected`);
        }
        catch (err) {
            this.logger.error('Google callback error', err);
            return res.redirect(`${redirectBase}?google=error`);
        }
    }
    getStatus(user) {
        return this.googleAuth.getStatus(user.id);
    }
    disconnect(user) {
        return this.googleAuth.disconnect(user.id);
    }
    syncAll(user, familyId) {
        return this.googleSync.syncAllEvents(familyId, user.id);
    }
    async exportAll(user, familyId, body) {
        try {
            return await this.googleSync.syncAllEvents(familyId, user.id, body.cleanup ?? false);
        }
        catch (err) {
            this.logger.error('Google Calendar export failed', err);
            throw new common_1.InternalServerErrorException(err instanceof Error ? err.message : 'Google Calendar export failed');
        }
    }
};
exports.GoogleController = GoogleController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], GoogleController.prototype, "getAuthUrl", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Query)('error')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "callback", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], GoogleController.prototype, "getStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('disconnect'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], GoogleController.prototype, "disconnect", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequireFeature)('google_calendar'),
    (0, common_1.Get)('sync/:familyId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String]),
    __metadata("design:returntype", void 0)
], GoogleController.prototype, "syncAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequireFeature)('google_calendar'),
    (0, common_1.Post)('export/:familyId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String, Object]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "exportAll", null);
exports.GoogleController = GoogleController = GoogleController_1 = __decorate([
    (0, common_1.Controller)('auth/google'),
    __metadata("design:paramtypes", [google_auth_service_1.GoogleAuthService,
        google_calendar_sync_service_1.GoogleCalendarSyncService,
        config_1.ConfigService])
], GoogleController);
//# sourceMappingURL=google.controller.js.map