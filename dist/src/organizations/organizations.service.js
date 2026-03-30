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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const config_1 = require("@nestjs/config");
const MANAGER_ROLES = ['OWNER', 'ADMIN'];
let OrganizationsService = class OrganizationsService {
    prisma;
    mail;
    config;
    constructor(prisma, mail, config) {
        this.prisma = prisma;
        this.mail = mail;
        this.config = config;
    }
    generateInviteCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'KID-';
        for (let i = 0; i < 4; i++)
            code += chars[Math.floor(Math.random() * chars.length)];
        return code;
    }
    async getMembership(orgId, userId) {
        return this.prisma.orgMembership.findUnique({
            where: { userId_organizationId: { userId, organizationId: orgId } },
        });
    }
    async assertActiveMember(orgId, userId) {
        const m = await this.getMembership(orgId, userId);
        if (!m || m.status !== 'ACTIVE')
            throw new common_1.ForbiddenException('Active membership required');
        return m;
    }
    async assertManager(orgId, userId) {
        const m = await this.assertActiveMember(orgId, userId);
        if (!MANAGER_ROLES.includes(m.role))
            throw new common_1.ForbiddenException('Admin or Owner role required');
        return m;
    }
    async assertCanCreate(orgId, userId, permission) {
        const m = await this.prisma.orgMembership.findUnique({
            where: { userId_organizationId: { userId, organizationId: orgId } },
            include: { customRole: true },
        });
        if (!m || m.status !== 'ACTIVE')
            throw new common_1.ForbiddenException('Active membership required');
        if (MANAGER_ROLES.includes(m.role))
            return;
        if (m.customRole?.[permission])
            return;
        throw new common_1.ForbiddenException('You do not have permission to perform this action');
    }
    async create(userId, dto) {
        let inviteCode;
        do {
            inviteCode = this.generateInviteCode();
        } while (await this.prisma.organization.findUnique({ where: { inviteCode } }));
        return this.prisma.organization.create({
            data: {
                name: dto.name,
                type: dto.type,
                inviteCode,
                adminId: userId,
                description: dto.description,
                isPublic: dto.isPublic ?? false,
                members: { create: { userId, role: 'OWNER', status: 'ACTIVE' } },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
                },
            },
        });
    }
    async updateOrg(orgId, userId, dto) {
        await this.assertManager(orgId, userId);
        return this.prisma.organization.update({ where: { id: orgId }, data: dto });
    }
    async joinByCode(userId, dto) {
        const org = await this.prisma.organization.findUnique({
            where: { inviteCode: dto.inviteCode.toUpperCase() },
        });
        if (!org)
            throw new common_1.NotFoundException('Invalid invite code');
        const existing = await this.getMembership(org.id, userId);
        if (existing)
            throw new common_1.BadRequestException('You are already a member of this organization');
        const status = org.type === 'SCHOOL' ? 'PENDING' : 'ACTIVE';
        const [requester] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } }),
            this.prisma.orgMembership.create({
                data: { userId, organizationId: org.id, role: 'MEMBER', status },
            }),
        ]);
        if (status === 'PENDING') {
            const admin = await this.prisma.user.findUnique({
                where: { id: org.adminId },
                select: { firstName: true, email: true },
            });
            if (admin?.email) {
                void this.mail.sendJoinRequest({
                    adminEmail: admin.email,
                    adminName: admin.firstName,
                    orgName: org.name,
                    requesterName: requester ? `${requester.firstName} ${requester.lastName}` : 'Un usuario',
                });
            }
        }
        return {
            ...(await this.prisma.organization.findUnique({ where: { id: org.id } })),
            pendingApproval: status === 'PENDING',
        };
    }
    async findMine(userId) {
        const memberships = await this.prisma.orgMembership.findMany({
            where: { userId },
            include: {
                organization: { include: { _count: { select: { members: true, events: true } } } },
            },
            orderBy: { joinedAt: 'desc' },
        });
        return memberships.map((m) => ({ ...m.organization, role: m.role, status: m.status }));
    }
    async findOne(orgId, userId) {
        const membership = await this.prisma.orgMembership.findUnique({
            where: { userId_organizationId: { userId, organizationId: orgId } },
            include: { customRole: true },
        });
        if (!membership)
            throw new common_1.ForbiddenException('You are not a member of this organization');
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
            include: {
                members: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
                        customRole: true,
                    },
                    orderBy: { joinedAt: 'asc' },
                },
                venues: true,
                customRoles: { orderBy: { name: 'asc' } },
                _count: { select: { events: true, announcements: true } },
            },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        return {
            ...org,
            myRole: membership.role,
            myStatus: membership.status,
            myCustomRole: membership.customRole,
        };
    }
    async leave(orgId, userId) {
        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (org?.adminId === userId)
            throw new common_1.BadRequestException('Transfer ownership before leaving');
        await this.getMembership(orgId, userId);
        await this.prisma.orgMembership.delete({
            where: { userId_organizationId: { userId, organizationId: orgId } },
        });
        return { message: 'Left organization' };
    }
    async remove(orgId, userId) {
        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        if (org.adminId !== userId)
            throw new common_1.ForbiddenException('Only the owner can delete this organization');
        await this.prisma.organization.delete({ where: { id: orgId } });
        return { message: 'Organization deleted' };
    }
    async approveMember(orgId, targetUserId, adminId) {
        await this.assertManager(orgId, adminId);
        const membership = await this.getMembership(orgId, targetUserId);
        if (!membership)
            throw new common_1.NotFoundException('Member not found');
        if (membership.status === 'ACTIVE')
            throw new common_1.BadRequestException('Already active');
        const [updated, org, member] = await Promise.all([
            this.prisma.orgMembership.update({
                where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
                data: { status: 'ACTIVE', approvedById: adminId, approvedAt: new Date() },
            }),
            this.prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
            this.prisma.user.findUnique({
                where: { id: targetUserId },
                select: { firstName: true, email: true },
            }),
        ]);
        if (member?.email && org) {
            void this.mail.sendMemberApproved({
                toEmail: member.email,
                memberName: member.firstName,
                orgName: org.name,
            });
        }
        return updated;
    }
    async rejectMember(orgId, targetUserId, adminId) {
        await this.assertManager(orgId, adminId);
        await this.prisma.orgMembership.delete({
            where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
        });
        return { message: 'Member rejected' };
    }
    async updateMemberRole(orgId, targetUserId, adminId, dto) {
        const adminMembership = await this.assertManager(orgId, adminId);
        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (org?.adminId === targetUserId && dto.role !== 'OWNER')
            throw new common_1.BadRequestException('Cannot demote the organization owner');
        if (dto.role === 'OWNER' && adminMembership.role !== 'OWNER')
            throw new common_1.ForbiddenException('Only OWNER can promote to OWNER');
        return this.prisma.orgMembership.update({
            where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
            data: { role: dto.role },
        });
    }
    async removeMember(orgId, targetUserId, adminId) {
        await this.assertManager(orgId, adminId);
        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (org?.adminId === targetUserId)
            throw new common_1.BadRequestException('Cannot remove the organization owner');
        await this.prisma.orgMembership.delete({
            where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
        });
        return { message: 'Member removed' };
    }
    async findDirectory(orgId, userId, search) {
        await this.assertActiveMember(orgId, userId);
        return this.prisma.orgMembership.findMany({
            where: {
                organizationId: orgId,
                status: 'ACTIVE',
                ...(search && {
                    user: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                }),
            },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
                customRole: true,
            },
            orderBy: [{ role: 'asc' }, { user: { firstName: 'asc' } }],
        });
    }
    EVENT_INCLUDE = {
        organization: { select: { id: true, name: true, type: true } },
        venue: true,
        rsvps: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        _count: { select: { rsvps: true } },
    };
    async createEvent(orgId, userId, dto) {
        await this.assertCanCreate(orgId, userId, 'canCreateEvents');
        return this.prisma.orgEvent.create({
            data: {
                organizationId: orgId,
                createdById: userId,
                title: dto.title,
                startAt: new Date(dto.startAt),
                endAt: new Date(dto.endAt),
                allDay: dto.allDay ?? false,
                notes: dto.notes,
                venueId: dto.venueId,
                maxCapacity: dto.maxCapacity,
            },
            include: this.EVENT_INCLUDE,
        });
    }
    async bulkCreateEvents(orgId, userId, dto) {
        await this.assertCanCreate(orgId, userId, 'canCreateEvents');
        const start = dto.startTime ?? '09:00';
        const end = dto.endTime ?? '10:00';
        const created = await Promise.all(dto.dates.map((date) => {
            const startAt = dto.allDay
                ? new Date(`${date}T00:00:00.000Z`)
                : new Date(`${date}T${start}:00`);
            const endAt = dto.allDay
                ? new Date(`${date}T23:59:59.000Z`)
                : new Date(`${date}T${end}:00`);
            return this.prisma.orgEvent.create({
                data: {
                    organizationId: orgId,
                    createdById: userId,
                    title: dto.title,
                    startAt,
                    endAt,
                    allDay: dto.allDay ?? false,
                    venueId: dto.venueId,
                    maxCapacity: dto.maxCapacity,
                },
            });
        }));
        return { created: created.length, events: created };
    }
    async findEvents(orgId, userId, month) {
        await this.assertActiveMember(orgId, userId);
        const where = { organizationId: orgId };
        if (month) {
            const [y, m] = month.split('-').map(Number);
            where.startAt = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
        }
        return this.prisma.orgEvent.findMany({
            where,
            orderBy: { startAt: 'asc' },
            include: this.EVENT_INCLUDE,
        });
    }
    async deleteEvent(orgId, eventId, userId) {
        await this.assertManager(orgId, userId);
        await this.prisma.orgEvent.delete({ where: { id: eventId, organizationId: orgId } });
        return { message: 'Event deleted' };
    }
    async findAllMyOrgEvents(userId, month) {
        const memberships = await this.prisma.orgMembership.findMany({
            where: { userId, status: 'ACTIVE' },
        });
        const orgIds = memberships.map((m) => m.organizationId);
        if (orgIds.length === 0)
            return [];
        const where = { organizationId: { in: orgIds } };
        if (month) {
            const [y, m] = month.split('-').map(Number);
            where.startAt = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
        }
        return this.prisma.orgEvent.findMany({
            where,
            orderBy: { startAt: 'asc' },
            include: { organization: { select: { id: true, name: true, type: true } } },
        });
    }
    async upsertRsvp(orgId, eventId, userId, dto) {
        await this.assertActiveMember(orgId, userId);
        return this.prisma.orgRsvp.upsert({
            where: { orgEventId_userId: { orgEventId: eventId, userId } },
            create: { orgEventId: eventId, userId, status: dto.status, notes: dto.notes },
            update: { status: dto.status, notes: dto.notes },
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
        });
    }
    async getEventRsvps(orgId, eventId, userId) {
        await this.assertActiveMember(orgId, userId);
        const rsvps = await this.prisma.orgRsvp.findMany({
            where: { orgEventId: eventId },
            include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        });
        return {
            yes: rsvps.filter((r) => r.status === 'YES'),
            no: rsvps.filter((r) => r.status === 'NO'),
            maybe: rsvps.filter((r) => r.status === 'MAYBE'),
            myRsvp: rsvps.find((r) => r.userId === userId) ?? null,
        };
    }
    async createVenue(orgId, userId, dto) {
        await this.assertCanCreate(orgId, userId, 'canCreateVenues');
        return this.prisma.venue.create({
            data: { organizationId: orgId, ...dto },
        });
    }
    async findVenues(orgId, userId) {
        await this.assertActiveMember(orgId, userId);
        return this.prisma.venue.findMany({ where: { organizationId: orgId }, orderBy: { name: 'asc' } });
    }
    async deleteVenue(orgId, venueId, userId) {
        await this.assertManager(orgId, userId);
        await this.prisma.venue.delete({ where: { id: venueId, organizationId: orgId } });
        return { message: 'Venue deleted' };
    }
    async createAnnouncement(orgId, userId, dto) {
        await this.assertCanCreate(orgId, userId, 'canCreateAnnouncements');
        return this.prisma.announcement.create({
            data: { organizationId: orgId, authorId: userId, ...dto },
            include: { author: { select: { id: true, firstName: true, lastName: true } } },
        });
    }
    async findAnnouncements(orgId, userId) {
        await this.assertActiveMember(orgId, userId);
        return this.prisma.announcement.findMany({
            where: { organizationId: orgId },
            orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
            include: { author: { select: { id: true, firstName: true, lastName: true } } },
        });
    }
    async deleteAnnouncement(orgId, announcementId, userId) {
        await this.assertManager(orgId, userId);
        await this.prisma.announcement.delete({ where: { id: announcementId, organizationId: orgId } });
        return { message: 'Announcement deleted' };
    }
    async listCustomRoles(orgId, userId) {
        await this.assertManager(orgId, userId);
        return this.prisma.orgCustomRole.findMany({
            where: { organizationId: orgId },
            orderBy: { name: 'asc' },
            include: { _count: { select: { members: true } } },
        });
    }
    async createCustomRole(orgId, userId, dto) {
        await this.assertManager(orgId, userId);
        return this.prisma.orgCustomRole.create({
            data: { organizationId: orgId, ...dto },
        });
    }
    async updateCustomRole(orgId, roleId, userId, dto) {
        await this.assertManager(orgId, userId);
        return this.prisma.orgCustomRole.update({
            where: { id: roleId, organizationId: orgId },
            data: dto,
        });
    }
    async deleteCustomRole(orgId, roleId, userId) {
        await this.assertManager(orgId, userId);
        await this.prisma.orgCustomRole.delete({ where: { id: roleId, organizationId: orgId } });
        return { message: 'Role deleted' };
    }
    async assignCustomRole(orgId, targetUserId, adminId, dto) {
        await this.assertManager(orgId, adminId);
        return this.prisma.orgMembership.update({
            where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
            data: { customRoleId: dto.customRoleId ?? null },
            include: {
                customRole: true,
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    }
    async getPublicCalendar(orgId) {
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
            include: { events: { orderBy: { startAt: 'asc' }, include: { venue: true } } },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        if (!org.isPublic)
            throw new common_1.ForbiddenException('This organization calendar is private');
        return { org: { id: org.id, name: org.name, type: org.type }, events: org.events };
    }
    async generateIcs(orgId, userId) {
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
            include: { events: { orderBy: { startAt: 'asc' }, include: { venue: true } } },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        if (!org.isPublic)
            await this.assertActiveMember(orgId, userId);
        const ical = await import('ical-generator');
        const calendar = ical.default({ name: `${org.name} — KidSchedule` });
        for (const ev of org.events) {
            const event = calendar.createEvent({
                id: ev.id,
                start: ev.startAt,
                end: ev.endAt,
                summary: ev.title,
                description: ev.notes ?? '',
                allDay: ev.allDay,
            });
            if (ev.venue?.address)
                event.location(ev.venue.address);
        }
        return calendar.toString();
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        config_1.ConfigService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map