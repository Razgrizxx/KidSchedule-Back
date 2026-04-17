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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const throttler_1 = require("@nestjs/throttler");
const events_service_1 = require("./events.service");
const event_dto_1 = require("./dto/event.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_user_1 = require("../common/types/auth-user");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    create(user, familyId, dto) {
        return this.eventsService.create(familyId, user.id, dto);
    }
    findAll(user, familyId, month) {
        return this.eventsService.findAll(familyId, user.id, month);
    }
    update(user, familyId, eventId, dto) {
        return this.eventsService.update(familyId, eventId, user.id, dto);
    }
    getHolidays(user, familyId, yearStr, country) {
        const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
        return this.eventsService.getHolidays(familyId, user.id, year, country);
    }
    extractFromImage(user, familyId, file) {
        return this.eventsService.extractFromImage(familyId, user.id, file);
    }
    bulkCreate(user, familyId, dto) {
        return this.eventsService.bulkCreate(familyId, user.id, dto);
    }
    remove(user, familyId, eventId) {
        return this.eventsService.remove(familyId, eventId, user.id);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, event_dto_1.CreateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':eventId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('eventId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('holidays'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getHolidays", null);
__decorate([
    (0, throttler_1.Throttle)({ ai: { ttl: 60_000, limit: 5 } }),
    (0, common_1.Post)('extract-from-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "extractFromImage", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, event_dto_1.BulkImportDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Delete)(':eventId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "remove", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('families/:familyId/events'),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map