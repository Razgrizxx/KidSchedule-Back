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
exports.CaregiverInviteController = exports.CaregiversController = void 0;
const common_1 = require("@nestjs/common");
const caregivers_service_1 = require("./caregivers.service");
const caregiver_dto_1 = require("./dto/caregiver.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_user_1 = require("../common/types/auth-user");
let CaregiversController = class CaregiversController {
    caregiversService;
    constructor(caregiversService) {
        this.caregiversService = caregiversService;
    }
    create(user, familyId, dto) {
        return this.caregiversService.create(familyId, user.id, dto);
    }
    findAll(user, familyId) {
        return this.caregiversService.findAll(familyId, user.id);
    }
    findOne(user, familyId, caregiverId) {
        return this.caregiversService.findOne(familyId, caregiverId, user.id);
    }
    update(user, familyId, caregiverId, dto) {
        return this.caregiversService.update(familyId, caregiverId, user.id, dto);
    }
    remove(user, familyId, caregiverId) {
        return this.caregiversService.remove(familyId, caregiverId, user.id);
    }
    assignToChild(user, familyId, caregiverId, childId) {
        return this.caregiversService.assignToChild(familyId, caregiverId, childId, user.id);
    }
    unassignFromChild(user, familyId, caregiverId, childId) {
        return this.caregiversService.unassignFromChild(familyId, caregiverId, childId, user.id);
    }
};
exports.CaregiversController = CaregiversController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, caregiver_dto_1.CreateCaregiverDto]),
    __metadata("design:returntype", void 0)
], CaregiversController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], CaregiversController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':caregiverId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('caregiverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], CaregiversController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':caregiverId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('caregiverId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, caregiver_dto_1.UpdateCaregiverDto]),
    __metadata("design:returntype", void 0)
], CaregiversController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':caregiverId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('caregiverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], CaregiversController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':caregiverId/assign/:childId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('caregiverId')),
    __param(3, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, String]),
    __metadata("design:returntype", void 0)
], CaregiversController.prototype, "assignToChild", null);
__decorate([
    (0, common_1.Delete)(':caregiverId/assign/:childId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('caregiverId')),
    __param(3, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, String]),
    __metadata("design:returntype", void 0)
], CaregiversController.prototype, "unassignFromChild", null);
exports.CaregiversController = CaregiversController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('families/:familyId/caregivers'),
    __metadata("design:paramtypes", [caregivers_service_1.CaregiversService])
], CaregiversController);
let CaregiverInviteController = class CaregiverInviteController {
    caregiversService;
    constructor(caregiversService) {
        this.caregiversService = caregiversService;
    }
    resolveToken(token) {
        return this.caregiversService.resolveByToken(token);
    }
};
exports.CaregiverInviteController = CaregiverInviteController;
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaregiverInviteController.prototype, "resolveToken", null);
exports.CaregiverInviteController = CaregiverInviteController = __decorate([
    (0, common_1.Controller)('caregivers/invite'),
    __metadata("design:paramtypes", [caregivers_service_1.CaregiversService])
], CaregiverInviteController);
//# sourceMappingURL=caregivers.controller.js.map