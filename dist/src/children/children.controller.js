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
exports.ChildrenController = void 0;
const common_1 = require("@nestjs/common");
const children_service_1 = require("./children.service");
const child_dto_1 = require("./dto/child.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_user_1 = require("../common/types/auth-user");
let ChildrenController = class ChildrenController {
    childrenService;
    constructor(childrenService) {
        this.childrenService = childrenService;
    }
    create(user, familyId, dto) {
        return this.childrenService.create(familyId, user.id, dto);
    }
    findAll(user, familyId) {
        return this.childrenService.findAll(familyId, user.id);
    }
    findOne(user, familyId, childId) {
        return this.childrenService.findOne(familyId, childId, user.id);
    }
    update(user, familyId, childId, dto) {
        return this.childrenService.update(familyId, childId, user.id, dto);
    }
    remove(user, familyId, childId) {
        return this.childrenService.remove(familyId, childId, user.id);
    }
};
exports.ChildrenController = ChildrenController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, child_dto_1.CreateChildDto]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':childId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':childId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('childId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, child_dto_1.UpdateChildDto]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':childId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "remove", null);
exports.ChildrenController = ChildrenController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('families/:familyId/children'),
    __metadata("design:paramtypes", [children_service_1.ChildrenService])
], ChildrenController);
//# sourceMappingURL=children.controller.js.map