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
exports.EmergencyContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmergencyContactsService = class EmergencyContactsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(familyId, userId, dto) {
        return this.prisma.emergencyContact.create({
            data: {
                familyId,
                createdBy: userId,
                childId: dto.childId,
                role: dto.role,
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
                address: dto.address,
                notes: dto.notes,
                isPrimary: dto.isPrimary ?? false,
            },
            include: { createdByUser: { select: { id: true, firstName: true } } },
        });
    }
    async findAll(familyId, childId) {
        return this.prisma.emergencyContact.findMany({
            where: {
                familyId,
                ...(childId && { childId }),
            },
            include: { createdByUser: { select: { id: true, firstName: true } } },
            orderBy: [{ childId: 'asc' }, { isPrimary: 'desc' }, { role: 'asc' }],
        });
    }
    async update(familyId, id, userId, dto) {
        const contact = await this.prisma.emergencyContact.findFirst({ where: { id, familyId } });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        return this.prisma.emergencyContact.update({
            where: { id },
            data: {
                ...(dto.role !== undefined && { role: dto.role }),
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.email !== undefined && { email: dto.email }),
                ...(dto.address !== undefined && { address: dto.address }),
                ...(dto.notes !== undefined && { notes: dto.notes }),
                ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
            },
            include: { createdByUser: { select: { id: true, firstName: true } } },
        });
    }
    async remove(familyId, id, userId) {
        const contact = await this.prisma.emergencyContact.findFirst({ where: { id, familyId } });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        if (contact.createdBy !== userId)
            throw new common_1.ForbiddenException('Only the creator can delete');
        await this.prisma.emergencyContact.delete({ where: { id } });
    }
};
exports.EmergencyContactsService = EmergencyContactsService;
exports.EmergencyContactsService = EmergencyContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmergencyContactsService);
//# sourceMappingURL=emergency-contacts.service.js.map