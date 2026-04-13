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
var OutlookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const outlook_auth_service_1 = require("./outlook-auth.service");
const outlook_calendar_sync_service_1 = require("./outlook-calendar-sync.service");
let OutlookController = OutlookController_1 = class OutlookController {
    outlookAuth;
    outlookSync;
    config;
    logger = new common_1.Logger(OutlookController_1.name);
    constructor(outlookAuth, outlookSync, config) {
        this.outlookAuth = outlookAuth;
        this.outlookSync = outlookSync;
        this.config = config;
    }
    getAuthUrl(user) {
        return { url: this.outlookAuth.getAuthUrl(user.id) };
    }
    async callback(code, state, error, res) {
        const appUrl = this.config.get('APP_URL', 'http://localhost:5173');
        const redirectBase = `${appUrl}/#/dashboard/settings`;
        if (error || !code) {
            return res.redirect(`${redirectBase}?outlook=error`);
        }
        try {
            const userId = this.outlookAuth.verifyState(state);
            await this.outlookAuth.handleCallback(code, userId);
            return res.redirect(`${redirectBase}?outlook=connected`);
        }
        catch {
            return res.redirect(`${redirectBase}?outlook=error`);
        }
    }
    getStatus(user) {
        return this.outlookAuth.getStatus(user.id);
    }
    disconnect(user) {
        return this.outlookAuth.disconnect(user.id);
    }
    async exportAll(user, familyId, body) {
        try {
            return await this.outlookSync.syncAllEvents(familyId, user.id, body.cleanup ?? false);
        }
        catch (err) {
            this.logger.error('Outlook Calendar export failed', err);
            throw new common_1.InternalServerErrorException(err instanceof Error ? err.message : 'Outlook Calendar export failed');
        }
    }
};
exports.OutlookController = OutlookController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], OutlookController.prototype, "getAuthUrl", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Query)('error')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OutlookController.prototype, "callback", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], OutlookController.prototype, "getStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('disconnect'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], OutlookController.prototype, "disconnect", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('export/:familyId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String, Object]),
    __metadata("design:returntype", Promise)
], OutlookController.prototype, "exportAll", null);
exports.OutlookController = OutlookController = OutlookController_1 = __decorate([
    (0, common_1.Controller)('auth/outlook'),
    __metadata("design:paramtypes", [outlook_auth_service_1.OutlookAuthService,
        outlook_calendar_sync_service_1.OutlookCalendarSyncService,
        config_1.ConfigService])
], OutlookController);
//# sourceMappingURL=outlook.controller.js.map