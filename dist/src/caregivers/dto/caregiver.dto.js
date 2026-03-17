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
exports.UpdateCaregiverDto = exports.CreateCaregiverDto = void 0;
const class_validator_1 = require("class-validator");
const mapped_types_1 = require("@nestjs/mapped-types");
const client_1 = require("@prisma/client");
class CreateCaregiverDto {
    name;
    phone;
    email;
    relationship;
    visibility;
    linkExpiry;
    canViewCalendar;
    canViewHealthInfo;
    canViewEmergencyContacts;
}
exports.CreateCaregiverDto = CreateCaregiverDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCaregiverDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCaregiverDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateCaregiverDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCaregiverDto.prototype, "relationship", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.CaregiverVisibility),
    __metadata("design:type", String)
], CreateCaregiverDto.prototype, "visibility", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.CaregiverLinkExpiry),
    __metadata("design:type", String)
], CreateCaregiverDto.prototype, "linkExpiry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCaregiverDto.prototype, "canViewCalendar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCaregiverDto.prototype, "canViewHealthInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCaregiverDto.prototype, "canViewEmergencyContacts", void 0);
class UpdateCaregiverDto extends (0, mapped_types_1.PartialType)(CreateCaregiverDto) {
}
exports.UpdateCaregiverDto = UpdateCaregiverDto;
//# sourceMappingURL=caregiver.dto.js.map