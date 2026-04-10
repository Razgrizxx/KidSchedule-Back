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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_user_1 = require("../common/types/auth-user");
const health_service_1 = require("./health.service");
const health_dto_1 = require("./dto/health.dto");
let HealthController = class HealthController {
    healthService;
    constructor(healthService) {
        this.healthService = healthService;
    }
    getSummary(user, familyId, childId) {
        return this.healthService.getSummary(familyId, user.id, childId);
    }
    createRecord(user, familyId, dto) {
        return this.healthService.createRecord(familyId, user.id, dto);
    }
    getRecords(user, familyId, childId) {
        return this.healthService.getRecords(familyId, user.id, childId);
    }
    getRecord(user, familyId, recordId) {
        return this.healthService.getRecord(familyId, recordId, user.id);
    }
    updateRecord(user, familyId, recordId, dto) {
        return this.healthService.updateRecord(familyId, recordId, user.id, dto);
    }
    deleteRecord(user, familyId, recordId) {
        return this.healthService.deleteRecord(familyId, recordId, user.id);
    }
    uploadDocument(user, familyId, dto, file) {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        return this.healthService.uploadDocument(familyId, user.id, dto, file);
    }
    getDocuments(user, familyId, childId) {
        return this.healthService.getDocuments(familyId, user.id, childId);
    }
    deleteDocument(user, familyId, documentId) {
        return this.healthService.deleteDocument(familyId, documentId, user.id);
    }
    createMedication(user, familyId, dto) {
        return this.healthService.createMedication(familyId, user.id, dto);
    }
    getMedications(user, familyId, childId) {
        return this.healthService.getMedications(familyId, user.id, childId);
    }
    updateMedication(user, familyId, medicationId, dto) {
        return this.healthService.updateMedication(familyId, medicationId, user.id, dto);
    }
    deleteMedication(user, familyId, medicationId) {
        return this.healthService.deleteMedication(familyId, medicationId, user.id);
    }
    createAllergy(user, familyId, dto) {
        return this.healthService.createAllergy(familyId, user.id, dto);
    }
    getAllergies(user, familyId, childId) {
        return this.healthService.getAllergies(familyId, user.id, childId);
    }
    deleteAllergy(user, familyId, allergyId) {
        return this.healthService.deleteAllergy(familyId, allergyId, user.id);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)('summary/:childId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)('records'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, health_dto_1.CreateHealthRecordDto]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "createRecord", null);
__decorate([
    (0, common_1.Get)('records'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Query)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getRecords", null);
__decorate([
    (0, common_1.Get)('records/:recordId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('recordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getRecord", null);
__decorate([
    (0, common_1.Patch)('records/:recordId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('recordId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, health_dto_1.UpdateHealthRecordDto]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "updateRecord", null);
__decorate([
    (0, common_1.Delete)('records/:recordId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('recordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "deleteRecord", null);
__decorate([
    (0, common_1.Post)('documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 25 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const allowed = [
                'image/jpeg', 'image/png', 'image/webp',
                'application/pdf',
            ];
            if (!allowed.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Only images and PDFs are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, health_dto_1.CreateDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('documents'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Query)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Delete)('documents/:documentId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Post)('medications'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, health_dto_1.CreateMedicationDto]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "createMedication", null);
__decorate([
    (0, common_1.Get)('medications'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Query)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getMedications", null);
__decorate([
    (0, common_1.Patch)('medications/:medicationId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('medicationId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, health_dto_1.UpdateMedicationDto]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "updateMedication", null);
__decorate([
    (0, common_1.Delete)('medications/:medicationId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('medicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "deleteMedication", null);
__decorate([
    (0, common_1.Post)('allergies'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, health_dto_1.CreateAllergyDto]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "createAllergy", null);
__decorate([
    (0, common_1.Get)('allergies'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Query)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getAllergies", null);
__decorate([
    (0, common_1.Delete)('allergies/:allergyId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('allergyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "deleteAllergy", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('families/:familyId/health'),
    __metadata("design:paramtypes", [health_service_1.HealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map