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
exports.MediationController = void 0;
const common_1 = require("@nestjs/common");
const mediation_service_1 = require("./mediation.service");
const mediation_dto_1 = require("./dto/mediation.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_user_1 = require("../common/types/auth-user");
let MediationController = class MediationController {
    mediationService;
    constructor(mediationService) {
        this.mediationService = mediationService;
    }
    getStats(user, familyId) {
        return this.mediationService.getStats(familyId, user.id);
    }
    createSession(user, familyId, dto) {
        return this.mediationService.createSession(familyId, user.id, dto);
    }
    getSessions(user, familyId) {
        return this.mediationService.getSessions(familyId, user.id);
    }
    getSession(user, familyId, sessionId) {
        return this.mediationService.getSession(familyId, sessionId, user.id);
    }
    sendMessage(user, familyId, sessionId, dto) {
        return this.mediationService.sendMessage(familyId, sessionId, user.id, dto);
    }
    askAI(user, familyId, sessionId) {
        return this.mediationService.askAI(familyId, sessionId, user.id);
    }
    proposeResolution(user, familyId, sessionId, dto) {
        return this.mediationService.proposeResolution(familyId, sessionId, user.id, dto);
    }
    respondProposal(user, familyId, sessionId, proposalId, dto) {
        return this.mediationService.respondProposal(familyId, sessionId, proposalId, user.id, dto);
    }
    escalate(user, familyId, sessionId) {
        return this.mediationService.escalate(familyId, sessionId, user.id);
    }
    getCourtReport(user, familyId, sessionId) {
        return this.mediationService.getCourtReport(familyId, sessionId, user.id);
    }
};
exports.MediationController = MediationController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, mediation_dto_1.CreateSessionDto]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Get)(':sessionId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)(':sessionId/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('sessionId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, mediation_dto_1.SendMessageDto]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':sessionId/ask-ai'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "askAI", null);
__decorate([
    (0, common_1.Post)(':sessionId/propose'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('sessionId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, mediation_dto_1.ProposeResolutionDto]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "proposeResolution", null);
__decorate([
    (0, common_1.Patch)(':sessionId/proposals/:proposalId/respond'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('sessionId')),
    __param(3, (0, common_1.Param)('proposalId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, String, mediation_dto_1.RespondProposalDto]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "respondProposal", null);
__decorate([
    (0, common_1.Patch)(':sessionId/escalate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "escalate", null);
__decorate([
    (0, common_1.Get)(':sessionId/court-report'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('familyId')),
    __param(2, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], MediationController.prototype, "getCourtReport", null);
exports.MediationController = MediationController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('families/:familyId/mediation'),
    __metadata("design:paramtypes", [mediation_service_1.MediationService])
], MediationController);
//# sourceMappingURL=mediation.controller.js.map