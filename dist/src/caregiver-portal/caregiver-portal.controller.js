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
exports.CaregiverPortalController = void 0;
const common_1 = require("@nestjs/common");
const caregiver_portal_service_1 = require("./caregiver-portal.service");
let CaregiverPortalController = class CaregiverPortalController {
    service;
    constructor(service) {
        this.service = service;
    }
    getDashboard(token) {
        if (!token)
            throw new common_1.BadRequestException('Missing x-caregiver-token header');
        return this.service.getDashboard(token);
    }
};
exports.CaregiverPortalController = CaregiverPortalController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Headers)('x-caregiver-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaregiverPortalController.prototype, "getDashboard", null);
exports.CaregiverPortalController = CaregiverPortalController = __decorate([
    (0, common_1.Controller)('caregiver-portal'),
    __metadata("design:paramtypes", [caregiver_portal_service_1.CaregiverPortalService])
], CaregiverPortalController);
//# sourceMappingURL=caregiver-portal.controller.js.map