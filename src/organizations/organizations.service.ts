import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BulkCreateOrgEventsDto,
  CreateAnnouncementDto,
  CreateOrgDto,
  CreateOrgEventDto,
  CreateVenueDto,
  JoinOrgDto,
  RsvpDto,
  UpdateMemberRoleDto,
} from './dto/organization.dto';
import { OrgMemberStatus, OrgRole } from '@prisma/client';

// Members with at least this role can manage content
const MANAGER_ROLES: OrgRole[] = ['OWNER', 'ADMIN'];

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

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
        members: { create: { userId, role: 'OWNER', status: 'ACTIVE' } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
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

    await this.prisma.orgMembership.create({
      data: { userId, organizationId: org.id, role: 'MEMBER', status },
    });

    return {
      ...(await this.prisma.organization.findUnique({ where: { id: org.id } })),
      pendingApproval: status === 'PENDING',
    };
  }

  async findMine(userId: string) {
    const memberships = await this.prisma.orgMembership.findMany({
      where: { userId },
      include: {
        organization: { include: { _count: { select: { members: true, events: true } } } },
      },
      orderBy: { joinedAt: 'desc' },
    });
    return memberships.map((m) => ({ ...m.organization, role: m.role, status: m.status }));
  }

  async findOne(orgId: string, userId: string) {
    const membership = await this.getMembership(orgId, userId);
    if (!membership) throw new ForbiddenException('You are not a member of this organization');

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        venues: true,
        _count: { select: { events: true, announcements: true } },
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return { ...org, myRole: membership.role, myStatus: membership.status };
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

    return this.prisma.orgMembership.update({
      where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
      data: { status: 'ACTIVE', approvedById: adminId, approvedAt: new Date() },
    });
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
    await this.assertManager(orgId, userId);
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
    await this.assertManager(orgId, userId);
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
    await this.assertManager(orgId, userId);
    return this.prisma.venue.create({
      data: { organizationId: orgId, ...dto },
    });
  }

  async findVenues(orgId: string, userId: string) {
    await this.assertActiveMember(orgId, userId);
    return this.prisma.venue.findMany({ where: { organizationId: orgId }, orderBy: { name: 'asc' } });
  }

  async deleteVenue(orgId: string, venueId: string, userId: string) {
    await this.assertManager(orgId, userId);
    await this.prisma.venue.delete({ where: { id: venueId, organizationId: orgId } });
    return { message: 'Venue deleted' };
  }

  // ── Announcements ──────────────────────────────────────────────────────────

  async createAnnouncement(orgId: string, userId: string, dto: CreateAnnouncementDto) {
    await this.assertManager(orgId, userId);
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
