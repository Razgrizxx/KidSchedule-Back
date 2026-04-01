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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const settings_service_1 = require("./settings.service");
const update_family_settings_dto_1 = require("./dto/update-family-settings.dto");
const update_user_settings_dto_1 = require("./dto/update-user-settings.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_user_1 = require("../common/types/auth-user");
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    getFamilySettings(familyId, user) {
        return this.settingsService.getFamilySettings(familyId, user.id);
    }
    updateFamilySettings(familyId, user, dto) {
        return this.settingsService.updateFamilySettings(familyId, user.id, dto);
    }
    getUserSettings(user) {
        return this.settingsService.getUserSettings(user.id);
    }
    updateUserSettings(user, dto) {
        return this.settingsService.updateUserSettings(user.id, dto);
    }
    uploadAvatar(user, file) {
        if (!file)
            throw new common_1.BadRequestException('Image file is required');
        return this.settingsService.uploadAvatar(user.id, file);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('families/:familyId/settings'),
    __param(0, (0, common_1.Param)('familyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_user_1.AuthUser]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getFamilySettings", null);
__decorate([
    (0, common_1.Patch)('families/:familyId/settings'),
    __param(0, (0, common_1.Param)('familyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_user_1.AuthUser,
        update_family_settings_dto_1.UpdateFamilySettingsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateFamilySettings", null);
__decorate([
    (0, common_1.Get)('users/me/settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getUserSettings", null);
__decorate([
    (0, common_1.Patch)('users/me/settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser,
        update_user_settings_dto_1.UpdateUserSettingsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateUserSettings", null);
__decorate([
    (0, common_1.Post)('users/me/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "uploadAvatar", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map