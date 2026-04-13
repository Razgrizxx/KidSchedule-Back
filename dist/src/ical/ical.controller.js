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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcalController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const ical_service_1 = require("./ical.service");
let IcalController = class IcalController {
    ical;
    config;
    constructor(ical, config) {
        this.ical = ical;
        this.config = config;
    }
    async getFeedUrl(user) {
        const token = await this.ical.getOrCreateFeedToken(user.id);
        const baseUrl = this.config.get('API_URL', 'http://localhost:3000/api/v1');
        const feedUrl = `${baseUrl}/ical/${token}/calendar.ics`.replace(/^https?:\/\//, 'webcal://');
        return { feedUrl, token };
    }
    async rotateFeedToken(user) {
        const token = await this.ical.rotateFeedToken(user.id);
        const baseUrl = this.config.get('API_URL', 'http://localhost:3000/api/v1');
        const feedUrl = `${baseUrl}/ical/${token}/calendar.ics`.replace(/^https?:\/\//, 'webcal://');
        return { feedUrl, token };
    }
    async getFeed(token, res) {
        try {
            const content = await this.ical.generateFeed(token);
            res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="kidschedule.ics"');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.send(content);
        }
        catch {
            return res.status(404).send('Feed not found');
        }
    }
};
exports.IcalController = IcalController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('ical/feed-url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], IcalController.prototype, "getFeedUrl", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('ical/feed-url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], IcalController.prototype, "rotateFeedToken", null);
__decorate([
    (0, common_1.Get)('ical/:token/calendar.ics'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IcalController.prototype, "getFeed", null);
exports.IcalController = IcalController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [ical_service_1.IcalService,
        config_1.ConfigService])
], IcalController);
//# sourceMappingURL=ical.controller.js.map