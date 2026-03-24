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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const organizations_service_1 = require("./organizations.service");
const organization_dto_1 = require("./dto/organization.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_user_1 = require("../common/types/auth-user");
const subscription_guard_1 = require("../stripe/subscription.guard");
let OrganizationsController = class OrganizationsController {
    orgsService;
    constructor(orgsService) {
        this.orgsService = orgsService;
    }
    create(user, dto) {
        return this.orgsService.create(user.id, dto);
    }
    join(user, dto) {
        return this.orgsService.joinByCode(user.id, dto);
    }
    findMine(user) {
        return this.orgsService.findMine(user.id);
    }
    findAllMyEvents(user, month) {
        return this.orgsService.findAllMyOrgEvents(user.id, month);
    }
    findOne(user, id) {
        return this.orgsService.findOne(id, user.id);
    }
    remove(user, id) {
        return this.orgsService.remove(id, user.id);
    }
    leave(user, id) {
        return this.orgsService.leave(id, user.id);
    }
    directory(user, id, search) {
        return this.orgsService.findDirectory(id, user.id, search);
    }
    approveMember(user, id, targetUserId) {
        return this.orgsService.approveMember(id, targetUserId, user.id);
    }
    rejectMember(user, id, targetUserId) {
        return this.orgsService.rejectMember(id, targetUserId, user.id);
    }
    updateMemberRole(user, id, targetUserId, dto) {
        return this.orgsService.updateMemberRole(id, targetUserId, user.id, dto);
    }
    removeMember(user, id, targetUserId) {
        return this.orgsService.removeMember(id, targetUserId, user.id);
    }
    createEvent(user, id, dto) {
        return this.orgsService.createEvent(id, user.id, dto);
    }
    bulkCreateEvents(user, id, dto) {
        return this.orgsService.bulkCreateEvents(id, user.id, dto);
    }
    findEvents(user, id, month) {
        return this.orgsService.findEvents(id, user.id, month);
    }
    deleteEvent(user, id, eventId) {
        return this.orgsService.deleteEvent(id, eventId, user.id);
    }
    upsertRsvp(user, id, eventId, dto) {
        return this.orgsService.upsertRsvp(id, eventId, user.id, dto);
    }
    getEventRsvps(user, id, eventId) {
        return this.orgsService.getEventRsvps(id, eventId, user.id);
    }
    createVenue(user, id, dto) {
        return this.orgsService.createVenue(id, user.id, dto);
    }
    findVenues(user, id) {
        return this.orgsService.findVenues(id, user.id);
    }
    deleteVenue(user, id, venueId) {
        return this.orgsService.deleteVenue(id, venueId, user.id);
    }
    createAnnouncement(user, id, dto) {
        return this.orgsService.createAnnouncement(id, user.id, dto);
    }
    findAnnouncements(user, id) {
        return this.orgsService.findAnnouncements(id, user.id);
    }
    deleteAnnouncement(user, id, announcementId) {
        return this.orgsService.deleteAnnouncement(id, announcementId, user.id);
    }
    async exportIcs(user, id, res) {
        const ics = await this.orgsService.generateIcs(id, user.id);
        res.set({
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="kidschedule-${id}.ics"`,
        });
        res.send(ics);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, organization_dto_1.CreateOrgDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, organization_dto_1.JoinOrgDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "join", null);
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findAllMyEvents", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(':id/leave'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "leave", null);
__decorate([
    (0, common_1.Get)(':id/directory'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "directory", null);
__decorate([
    (0, common_1.Patch)(':id/members/:userId/approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "approveMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId/reject'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "rejectMember", null);
__decorate([
    (0, common_1.Patch)(':id/members/:userId/role'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, organization_dto_1.UpdateMemberRoleDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/events'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, organization_dto_1.CreateOrgEventDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Post)(':id/events/bulk'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, organization_dto_1.BulkCreateOrgEventsDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "bulkCreateEvents", null);
__decorate([
    (0, common_1.Get)(':id/events'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findEvents", null);
__decorate([
    (0, common_1.Delete)(':id/events/:eventId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "deleteEvent", null);
__decorate([
    (0, common_1.Post)(':id/events/:eventId/rsvp'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('eventId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String, organization_dto_1.RsvpDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "upsertRsvp", null);
__decorate([
    (0, common_1.Get)(':id/events/:eventId/rsvp'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "getEventRsvps", null);
__decorate([
    (0, common_1.Post)(':id/venues'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, organization_dto_1.CreateVenueDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "createVenue", null);
__decorate([
    (0, common_1.Get)(':id/venues'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findVenues", null);
__decorate([
    (0, common_1.Delete)(':id/venues/:venueId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('venueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "deleteVenue", null);
__decorate([
    (0, common_1.Post)(':id/announcements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, organization_dto_1.CreateAnnouncementDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Get)(':id/announcements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findAnnouncements", null);
__decorate([
    (0, common_1.Delete)(':id/announcements/:announcementId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('announcementId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Get)(':id/calendar.ics'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_1.AuthUser, String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "exportIcs", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequireFeature)('organizations'),
    (0, common_1.Controller)('organizations'),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map