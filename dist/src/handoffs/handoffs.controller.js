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
exports.HandoffsController = void 0;
const common_1 = require("@nestjs/common");
const handoffs_service_1 = require("./handoffs.service");
const handoff_dto_1 = require("./dto/handoff.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_user_1 = require("../common/types/auth-user");
let HandoffsController = class HandoffsController {
    handoffsService;
    constructor(handoffsService) {
        this.handoffsService = handoffsService;
    }
    create(familyId, user, dto) {
        return this.handoffsService.create(familyId, user.id, dto);
    }
    findAll(familyId, user, childId, from, to, take, cursor) {
        return this.handoffsService.findAll(familyId, user.id, {
            childId,
            from,
            to,
            take: take ? Math.min(Number(take), 100) : 30,
            cursor,
        });
    }
    confirm(familyId, handoffId, user) {
        return this.handoffsService.confirm(familyId, handoffId, user.id);
    }
    remove(familyId, handoffId, user) {
        return this.handoffsService.remove(familyId, handoffId, user.id);
    }
};
exports.HandoffsController = HandoffsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('familyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_user_1.AuthUser,
        handoff_dto_1.CreateHandoffDto]),
    __metadata("design:returntype", void 0)
], HandoffsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('familyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('childId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Query)('take')),
    __param(6, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_user_1.AuthUser, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], HandoffsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':handoffId/confirm'),
    __param(0, (0, common_1.Param)('familyId')),
    __param(1, (0, common_1.Param)('handoffId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, auth_user_1.AuthUser]),
    __metadata("design:returntype", void 0)
], HandoffsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Delete)(':handoffId'),
    __param(0, (0, common_1.Param)('familyId')),
    __param(1, (0, common_1.Param)('handoffId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, auth_user_1.AuthUser]),
    __metadata("design:returntype", void 0)
], HandoffsController.prototype, "remove", null);
exports.HandoffsController = HandoffsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('families/:familyId/handoffs'),
    __metadata("design:paramtypes", [handoffs_service_1.HandoffsService])
], HandoffsController);
//# sourceMappingURL=handoffs.controller.js.map