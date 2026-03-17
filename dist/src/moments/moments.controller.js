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
exports.MomentsController = void 0;
const common_1 = require("@nestjs/common");
const moments_service_1 = require("./moments.service");
const moment_dto_1 = require("./dto/moment.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_user_1 = require("../common/types/auth-user");
let MomentsController = class MomentsController {
    momentsService;
    constructor(momentsService) {
        this.momentsService = momentsService;
    }
    create(user, familyId, dto) {
        return this.momentsService.create(familyId, user.id, dto);
    }
    findAll(user, familyId, childId) {
        return this.momentsService.findAll(familyId, user.id, childId);
    }
    remove(user, familyId, momentId) {
        return this.momentsService.remove(familyId, momentId, user.id);
    }
};
exports.MomentsController = MomentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, moment_dto_1.CreateMomentDto]),
    __metadata("design:returntype", void 0)
], MomentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Query)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], MomentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':momentId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('momentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], MomentsController.prototype, "remove", null);
exports.MomentsController = MomentsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('families/:familyId/moments'),
    __metadata("design:paramtypes", [moments_service_1.MomentsService])
], MomentsController);
//# sourceMappingURL=moments.controller.js.map