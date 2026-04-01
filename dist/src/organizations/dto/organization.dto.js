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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrgRosterDto = exports.CreateAnnouncementDto = exports.CreateVenueDto = exports.RsvpDto = exports.AssignCustomRoleDto = exports.UpdateCustomRoleDto = exports.CreateCustomRoleDto = exports.UpdateMemberRoleDto = exports.UpdateOrgDto = exports.BulkCreateOrgEventsDto = exports.CreateOrgEventDto = exports.JoinOrgDto = exports.CreateOrgDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateOrgDto {
    name;
    type;
    description;
    isPublic;
}
exports.CreateOrgDto = CreateOrgDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.OrgType),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateOrgDto.prototype, "isPublic", void 0);
class JoinOrgDto {
    inviteCode;
}
exports.JoinOrgDto = JoinOrgDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], JoinOrgDto.prototype, "inviteCode", void 0);
class CreateOrgEventDto {
    title;
    startAt;
    endAt;
    allDay;
    notes;
    venueId;
    maxCapacity;
}
exports.CreateOrgEventDto = CreateOrgEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrgEventDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrgEventDto.prototype, "startAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrgEventDto.prototype, "endAt", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateOrgEventDto.prototype, "allDay", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrgEventDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrgEventDto.prototype, "venueId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateOrgEventDto.prototype, "maxCapacity", void 0);
class BulkCreateOrgEventsDto {
    title;
    dates;
    startTime;
    endTime;
    allDay;
    venueId;
    maxCapacity;
}
exports.BulkCreateOrgEventsDto = BulkCreateOrgEventsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkCreateOrgEventsDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkCreateOrgEventsDto.prototype, "dates", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkCreateOrgEventsDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkCreateOrgEventsDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BulkCreateOrgEventsDto.prototype, "allDay", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkCreateOrgEventsDto.prototype, "venueId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BulkCreateOrgEventsDto.prototype, "maxCapacity", void 0);
class UpdateOrgDto {
    isPublic;
}
exports.UpdateOrgDto = UpdateOrgDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateOrgDto.prototype, "isPublic", void 0);
class UpdateMemberRoleDto {
    role;
}
exports.UpdateMemberRoleDto = UpdateMemberRoleDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.OrgRole),
    __metadata("design:type", String)
], UpdateMemberRoleDto.prototype, "role", void 0);
class CreateCustomRoleDto {
    name;
    canCreateEvents;
    canCreateAnnouncements;
    canCreateVenues;
}
exports.CreateCustomRoleDto = CreateCustomRoleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], CreateCustomRoleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCustomRoleDto.prototype, "canCreateEvents", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCustomRoleDto.prototype, "canCreateAnnouncements", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCustomRoleDto.prototype, "canCreateVenues", void 0);
class UpdateCustomRoleDto {
    name;
    canCreateEvents;
    canCreateAnnouncements;
    canCreateVenues;
}
exports.UpdateCustomRoleDto = UpdateCustomRoleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(40),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCustomRoleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateCustomRoleDto.prototype, "canCreateEvents", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateCustomRoleDto.prototype, "canCreateAnnouncements", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateCustomRoleDto.prototype, "canCreateVenues", void 0);
class AssignCustomRoleDto {
    customRoleId;
}
exports.AssignCustomRoleDto = AssignCustomRoleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AssignCustomRoleDto.prototype, "customRoleId", void 0);
class RsvpDto {
    status;
    notes;
}
exports.RsvpDto = RsvpDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.RsvpStatus),
    __metadata("design:type", String)
], RsvpDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RsvpDto.prototype, "notes", void 0);
class CreateVenueDto {
    name;
    address;
    mapUrl;
    notes;
}
exports.CreateVenueDto = CreateVenueDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVenueDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVenueDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVenueDto.prototype, "mapUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVenueDto.prototype, "notes", void 0);
class CreateAnnouncementDto {
    title;
    content;
    pinned;
}
exports.CreateAnnouncementDto = CreateAnnouncementDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateAnnouncementDto.prototype, "pinned", void 0);
class CreateOrgRosterDto {
    firstName;
    lastName;
    parentName;
    parentEmail;
    parentPhone;
    notes;
    linkedChildId;
}
exports.CreateOrgRosterDto = CreateOrgRosterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrgRosterDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrgRosterDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrgRosterDto.prototype, "parentName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrgRosterDto.prototype, "parentEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrgRosterDto.prototype, "parentPhone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrgRosterDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrgRosterDto.prototype, "linkedChildId", void 0);
//# sourceMappingURL=organization.dto.js.map