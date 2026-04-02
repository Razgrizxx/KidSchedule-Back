import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import {
  AssignCustomRoleDto,
  BulkCreateOrgEventsDto,
  CreateAnnouncementDto,
  CreateCustomRoleDto,
  CreateOrgDto,
  CreateOrgEntityDto,
  CreateOrgEventDto,
  CreateOrgRosterDto,
  CreateVenueDto,
  JoinOrgDto,
  RsvpDto,
  UpdateCustomRoleDto,
  UpdateMemberRoleDto,
  UpdateOrgDto,
} from './dto/organization.dto';
import { OrgMemberStatus, OrgRole } from '@prisma/client';
import { randomUUID } from 'crypto';

// Members with at least this role can manage content
const MANAGER_ROLES: OrgRole[] = ['OWNER', 'ADMIN'];

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'KID-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  private async getMembership(orgId: string, userId: string) {
    return this.prisma.orgMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
  }

  async assertActiveMember(orgId: string, userId: string) {
    const m = await this.getMembership(orgId, userId);
    if (!m || m.status !== 'ACTIVE') throw new ForbiddenException('Active membership required');
    return m;
  }

  private async assertManager(orgId: string, userId: string) {
    const m = await this.assertActiveMember(orgId, userId);
    if (!MANAGER_ROLES.includes(m.role)) throw new ForbiddenException('Admin or Owner role required');
    return m;
  }

  private async assertCanCreate(
    orgId: string,
    userId: string,
    permission: 'canCreateEvents' | 'canCreateAnnouncements' | 'canCreateVenues',
  ) {
    const m = await this.prisma.orgMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      include: { customRole: true },
    });
    if (!m || m.status !== 'ACTIVE') throw new ForbiddenException('Active membership required');
    if (MANAGER_ROLES.includes(m.role)) return;
    if (m.customRole?.[permission]) return;
    throw new ForbiddenException('You do not have permission to perform this action');
  }

  // ── Entities ───────────────────────────────────────────────────────────────

  async createEntity(userId: string, dto: CreateOrgEntityDto) {
    return this.prisma.orgEntity.create({
      data: { ...dto, createdById: userId },
    });
  }

  async findMyEntities(userId: string) {
    // Entities the user created OR that contain groups the user belongs to
    const memberships = await this.prisma.orgMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { organization: { select: { entityId: true } } },
    });
    const entityIds = memberships
      .map((m) => m.organization.entityId)
      .filter((id): id is string => !!id);

    return this.prisma.orgEntity.findMany({
      where: { OR: [{ createdById: userId }, { id: { in: entityIds } }] },
      orderBy: { name: 'asc' },
    });
  }

  async updateEntity(entityId: string, userId: string, dto: Partial<CreateOrgEntityDto>) {
    const entity = await this.prisma.orgEntity.findUnique({ where: { id: entityId } });
    if (!entity) throw new NotFoundException('Entity not found');
    if (entity.createdById !== userId) throw new ForbiddenException('Only the creator can edit this entity');
    return this.prisma.orgEntity.update({ where: { id: entityId }, data: dto });
  }

  async deleteEntity(entityId: string, userId: string) {
    const entity = await this.prisma.orgEntity.findUnique({ where: { id: entityId } });
    if (!entity) throw new NotFoundException('Entity not found');
    if (entity.createdById !== userId) throw new ForbiddenException('Only the creator can delete this entity');
    // Detach groups before deleting
    await this.prisma.organization.updateMany({ where: { entityId }, data: { entityId: null } });
    await this.prisma.orgEntity.delete({ where: { id: entityId } });
    return { message: 'Entity deleted' };
  }

  // ── Organizations ──────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateOrgDto) {
    let inviteCode: string;
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
        entityId: dto.entityId ?? null,
        members: { create: { userId, role: 'OWNER', status: 'ACTIVE' } },
      },
      include: {
        entity: { select: { id: true, name: true, type: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
  }

  async updateOrg(orgId: string, userId: string, dto: UpdateOrgDto) {
    await this.assertManager(orgId, userId);
    return this.prisma.organization.update({ where: { id: orgId }, data: dto });
  }

  async joinByCode(userId: string, dto: JoinOrgDto) {
    const org = await this.prisma.organization.findUnique({
      where: { inviteCode: dto.inviteCode.toUpperCase() },
    });
    if (!org) throw new NotFoundException('Invalid invite code');

    const existing = await this.getMembership(org.id, userId);
    if (existing) throw new BadRequestException('You are already a member of this organization');

    // Schools: PENDING until admin approves. Teams: immediately ACTIVE.
    const status: OrgMemberStatus = org.type === 'SCHOOL' ? 'PENDING' : 'ACTIVE';

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

  async findMine(userId: string) {
    const memberships = await this.prisma.orgMembership.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            entity: { select: { id: true, name: true, type: true } },
            _count: { select: { members: true, events: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
    return memberships.map((m) => ({ ...m.organization, role: m.role, status: m.status }));
  }

  async findOne(orgId: string, userId: string) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      include: { customRole: true },
    });
    if (!membership) throw new ForbiddenException('You are not a member of this organization');

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
    if (!org) throw new NotFoundException('Organization not found');
    return {
      ...org,
      myRole: membership.role,
      myStatus: membership.status,
      myCustomRole: membership.customRole,
    };
  }

  async leave(orgId: string, userId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (org?.adminId === userId) throw new BadRequestException('Transfer ownership before leaving');
    await this.getMembership(orgId, userId); // existence check
    await this.prisma.orgMembership.delete({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    return { message: 'Left organization' };
  }

  async remove(orgId: string, userId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.adminId !== userId) throw new ForbiddenException('Only the owner can delete this organization');
    await this.prisma.organization.delete({ where: { id: orgId } });
    return { message: 'Organization deleted' };
  }

  // ── Member management ──────────────────────────────────────────────────────

  async approveMember(orgId: string, targetUserId: string, adminId: string) {
    await this.assertManager(orgId, adminId);
    const membership = await this.getMembership(orgId, targetUserId);
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.status === 'ACTIVE') throw new BadRequestException('Already active');

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

  async rejectMember(orgId: string, targetUserId: string, adminId: string) {
    await this.assertManager(orgId, adminId);
    await this.prisma.orgMembership.delete({
      where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
    });
    return { message: 'Member rejected' };
  }

  async updateMemberRole(orgId: string, targetUserId: string, adminId: string, dto: UpdateMemberRoleDto) {
    const adminMembership = await this.assertManager(orgId, adminId);
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (org?.adminId === targetUserId && dto.role !== 'OWNER')
      throw new BadRequestException('Cannot demote the organization owner');
    // Only OWNER can assign OWNER
    if (dto.role === 'OWNER' && adminMembership.role !== 'OWNER')
      throw new ForbiddenException('Only OWNER can promote to OWNER');

    return this.prisma.orgMembership.update({
      where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
      data: { role: dto.role },
    });
  }

  async removeMember(orgId: string, targetUserId: string, adminId: string) {
    await this.assertManager(orgId, adminId);
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (org?.adminId === targetUserId) throw new BadRequestException('Cannot remove the organization owner');
    await this.prisma.orgMembership.delete({
      where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
    });
    return { message: 'Member removed' };
  }

  async findDirectory(orgId: string, userId: string, search?: string) {
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

  // ── Events ─────────────────────────────────────────────────────────────────

  private readonly EVENT_INCLUDE = {
    organization: { select: { id: true, name: true, type: true } },
    venue: true,
    rsvps: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
    _count: { select: { rsvps: true } },
  };

  async createEvent(orgId: string, userId: string, dto: CreateOrgEventDto) {
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

  async bulkCreateEvents(orgId: string, userId: string, dto: BulkCreateOrgEventsDto) {
    await this.assertCanCreate(orgId, userId, 'canCreateEvents');
    const start = dto.startTime ?? '09:00';
    const end = dto.endTime ?? '10:00';

    const created = await Promise.all(
      dto.dates.map((date) => {
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
      }),
    );

    return { created: created.length, events: created };
  }

  async findEvents(orgId: string, userId: string, month?: string) {
    await this.assertActiveMember(orgId, userId);
    const where: any = { organizationId: orgId };
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

  async deleteEvent(orgId: string, eventId: string, userId: string) {
    await this.assertManager(orgId, userId);
    await this.prisma.orgEvent.delete({ where: { id: eventId, organizationId: orgId } });
    return { message: 'Event deleted' };
  }

  async findAllMyOrgEvents(userId: string, month?: string) {
    const memberships = await this.prisma.orgMembership.findMany({
      where: { userId, status: 'ACTIVE' },
    });
    const orgIds = memberships.map((m) => m.organizationId);
    if (orgIds.length === 0) return [];

    const where: any = { organizationId: { in: orgIds } };
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

  // ── RSVPs ──────────────────────────────────────────────────────────────────

  async upsertRsvp(orgId: string, eventId: string, userId: string, dto: RsvpDto) {
    await this.assertActiveMember(orgId, userId);
    return this.prisma.orgRsvp.upsert({
      where: { orgEventId_userId: { orgEventId: eventId, userId } },
      create: { orgEventId: eventId, userId, status: dto.status, notes: dto.notes },
      update: { status: dto.status, notes: dto.notes },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async getEventRsvps(orgId: string, eventId: string, userId: string) {
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

  // ── Venues ─────────────────────────────────────────────────────────────────

  async createVenue(orgId: string, userId: string, dto: CreateVenueDto) {
    await this.assertCanCreate(orgId, userId, 'canCreateVenues');
    return this.prisma.venue.create({
      data: { organizationId: orgId, ...dto },
    });
  }

  async findVenues(orgId: string, userId: string) {
    await this.assertActiveMember(orgId, userId);
    return this.prisma.venue.findMany({ where: { organizationId: orgId }, orderBy: { name: 'asc' } });
  }

  async updateVenue(orgId: string, venueId: string, userId: string, dto: CreateVenueDto) {
    await this.assertManager(orgId, userId);
    return this.prisma.venue.update({
      where: { id: venueId, organizationId: orgId },
      data: dto,
    });
  }

  async deleteVenue(orgId: string, venueId: string, userId: string) {
    await this.assertManager(orgId, userId);
    await this.prisma.venue.delete({ where: { id: venueId, organizationId: orgId } });
    return { message: 'Venue deleted' };
  }

  // ── Announcements ──────────────────────────────────────────────────────────

  async createAnnouncement(orgId: string, userId: string, dto: CreateAnnouncementDto) {
    await this.assertCanCreate(orgId, userId, 'canCreateAnnouncements');
    return this.prisma.announcement.create({
      data: { organizationId: orgId, authorId: userId, ...dto },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findAnnouncements(orgId: string, userId: string) {
    await this.assertActiveMember(orgId, userId);
    return this.prisma.announcement.findMany({
      where: { organizationId: orgId },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async deleteAnnouncement(orgId: string, announcementId: string, userId: string) {
    await this.assertManager(orgId, userId);
    await this.prisma.announcement.delete({ where: { id: announcementId, organizationId: orgId } });
    return { message: 'Announcement deleted' };
  }

  // ── Custom roles ───────────────────────────────────────────────────────────

  async listCustomRoles(orgId: string, userId: string) {
    await this.assertManager(orgId, userId);
    return this.prisma.orgCustomRole.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { members: true } } },
    });
  }

  async createCustomRole(orgId: string, userId: string, dto: CreateCustomRoleDto) {
    await this.assertManager(orgId, userId);
    return this.prisma.orgCustomRole.create({
      data: { organizationId: orgId, ...dto },
    });
  }

  async updateCustomRole(orgId: string, roleId: string, userId: string, dto: UpdateCustomRoleDto) {
    await this.assertManager(orgId, userId);
    return this.prisma.orgCustomRole.update({
      where: { id: roleId, organizationId: orgId },
      data: dto,
    });
  }

  async deleteCustomRole(orgId: string, roleId: string, userId: string) {
    await this.assertManager(orgId, userId);
    await this.prisma.orgCustomRole.delete({ where: { id: roleId, organizationId: orgId } });
    return { message: 'Role deleted' };
  }

  async assignCustomRole(orgId: string, targetUserId: string, adminId: string, dto: AssignCustomRoleDto) {
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

  // ── Members' children (for quick-add to roster) ───────────────────────────

  async getMembersChildren(orgId: string, userId: string) {
    await this.assertActiveMember(orgId, userId);

    const memberships = await this.prisma.orgMembership.findMany({
      where: { organizationId: orgId, status: 'ACTIVE' },
      select: { userId: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    const userIds = memberships.map((m) => m.userId);
    if (userIds.length === 0) return [];

    const familyMembers = await this.prisma.familyMember.findMany({
      where: { userId: { in: userIds } },
      select: {
        userId: true,
        family: {
          select: {
            children: { select: { id: true, firstName: true, lastName: true, color: true } },
          },
        },
      },
    });

    const userMap = Object.fromEntries(memberships.map((m) => [m.userId, m.user]));
    const seen = new Set<string>();
    const result: { parent: typeof memberships[number]['user']; child: { id: string; firstName: string; lastName: string; color: string } }[] = [];

    for (const fm of familyMembers) {
      const parent = userMap[fm.userId];
      if (!parent) continue;
      for (const child of fm.family.children) {
        const key = `${child.id}:${parent.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ parent, child });
      }
    }

    return result;
  }

  // ── Roster ─────────────────────────────────────────────────────────────────

  async getRoster(orgId: string, userId: string) {
    await this.assertActiveMember(orgId, userId);
    return this.prisma.orgRoster.findMany({
      where: { orgId },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      include: {
        linkedChild: {
          include: {
            family: {
              select: {
                members: {
                  select: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                  },
                },
              },
            },
          },
        },
        linkedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async addToRoster(orgId: string, userId: string, dto: CreateOrgRosterDto) {
    await this.assertManager(orgId, userId);

    // Auto-link if parentEmail matches an existing user
    let linkedUserId: string | undefined;
    if (dto.parentEmail) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.parentEmail },
        select: { id: true },
      });
      if (existing) linkedUserId = existing.id;
    }

    return this.prisma.orgRoster.create({
      data: {
        orgId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        parentName: dto.parentName,
        parentEmail: dto.parentEmail,
        parentPhone: dto.parentPhone,
        notes: dto.notes,
        linkedChildId: dto.linkedChildId,
        linkedUserId,
      },
      include: {
        linkedChild: { select: { id: true, firstName: true, lastName: true, color: true } },
        linkedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async removeFromRoster(orgId: string, rosterId: string, userId: string) {
    await this.assertManager(orgId, userId);
    await this.prisma.orgRoster.delete({ where: { id: rosterId, orgId } });
    return { message: 'Removed from roster' };
  }

  async sendRosterInvite(orgId: string, rosterId: string, userId: string) {
    await this.assertManager(orgId, userId);

    const entry = await this.prisma.orgRoster.findUnique({ where: { id: rosterId, orgId } });
    if (!entry) throw new NotFoundException('Roster entry not found');
    if (!entry.parentEmail) throw new BadRequestException('No parent email on this entry');

    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { name: true },
    });

    // Generate or reuse token
    const token = entry.inviteToken ?? randomUUID();
    if (!entry.inviteToken) {
      await this.prisma.orgRoster.update({ where: { id: rosterId }, data: { inviteToken: token } });
    }

    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:5173');
    const portalUrl = `${appUrl}/#/org-portal?token=${token}`;

    await this.mail.sendOrgRosterInvite({
      toEmail: entry.parentEmail,
      parentName: entry.parentName ?? entry.parentEmail,
      childName: `${entry.firstName} ${entry.lastName}`,
      orgName: org.name,
      portalUrl,
    });

    return { message: 'Invite sent' };
  }

  // ── Org portal (token-based read-only for non-app parents) ─────────────────

  async getPortalData(token: string) {
    const entry = await this.prisma.orgRoster.findUnique({
      where: { inviteToken: token },
      include: { org: { include: { events: { orderBy: { startAt: 'asc' }, include: { venue: true } } } } },
    });
    if (!entry) throw new NotFoundException('Invalid portal link');
    return {
      childName: `${entry.firstName} ${entry.lastName}`,
      org: { id: entry.org.id, name: entry.org.name, type: entry.org.type },
      events: entry.org.events,
    };
  }

  // ── Public calendar (no auth) ──────────────────────────────────────────────

  async getPublicCalendar(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { events: { orderBy: { startAt: 'asc' }, include: { venue: true } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    if (!org.isPublic) throw new ForbiddenException('This organization calendar is private');
    return { org: { id: org.id, name: org.name, type: org.type }, events: org.events };
  }

  // ── ICS export ─────────────────────────────────────────────────────────────

  async generateIcs(orgId: string, userId: string): Promise<string> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { events: { orderBy: { startAt: 'asc' }, include: { venue: true } } },
    });
    if (!org) throw new NotFoundException('Organization not found');

    // Check membership (or allow if public)
    if (!org.isPublic) await this.assertActiveMember(orgId, userId);

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
      if (ev.venue?.address) event.location(ev.venue.address);
    }

    return calendar.toString();
  }
}
