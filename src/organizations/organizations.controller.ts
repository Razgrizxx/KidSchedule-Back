import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { OrganizationsService } from './organizations.service';
import {
  AssignCustomRoleDto,
  BulkCreateOrgEventsDto,
  CreateAnnouncementDto,
  CreateCustomRoleDto,
  CreateOrgDto,
  CreateOrgEventDto,
  CreateVenueDto,
  JoinOrgDto,
  RsvpDto,
  UpdateCustomRoleDto,
  UpdateMemberRoleDto,
  UpdateOrgDto,
} from './dto/organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';
import { SubscriptionGuard, RequireFeature } from '../stripe/subscription.guard';

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  // ── Org CRUD ───────────────────────────────────────────────────────────────

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrgDto) {
    return this.orgsService.create(user.id, dto);
  }

  @Post('join')
  join(@CurrentUser() user: AuthUser, @Body() dto: JoinOrgDto) {
    return this.orgsService.joinByCode(user.id, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.orgsService.findMine(user.id);
  }

  @Get('events')
  findAllMyEvents(@CurrentUser() user: AuthUser, @Query('month') month?: string) {
    return this.orgsService.findAllMyOrgEvents(user.id, month);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orgsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateOrgDto) {
    return this.orgsService.updateOrg(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orgsService.remove(id, user.id);
  }

  @Delete(':id/leave')
  leave(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orgsService.leave(id, user.id);
  }

  // ── Member management ──────────────────────────────────────────────────────

  @Get(':id/directory')
  directory(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('search') search?: string,
  ) {
    return this.orgsService.findDirectory(id, user.id, search);
  }

  @Patch(':id/members/:userId/approve')
  approveMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.orgsService.approveMember(id, targetUserId, user.id);
  }

  @Delete(':id/members/:userId/reject')
  rejectMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.orgsService.rejectMember(id, targetUserId, user.id);
  }

  @Patch(':id/members/:userId/role')
  updateMemberRole(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.orgsService.updateMemberRole(id, targetUserId, user.id, dto);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.orgsService.removeMember(id, targetUserId, user.id);
  }

  @Patch(':id/members/:userId/custom-role')
  assignCustomRole(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body() dto: AssignCustomRoleDto,
  ) {
    return this.orgsService.assignCustomRole(id, targetUserId, user.id, dto);
  }

  // ── Custom roles ───────────────────────────────────────────────────────────

  @Get(':id/roles')
  listRoles(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orgsService.listCustomRoles(id, user.id);
  }

  @Post(':id/roles')
  createRole(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateCustomRoleDto,
  ) {
    return this.orgsService.createCustomRole(id, user.id, dto);
  }

  @Patch(':id/roles/:roleId')
  updateRole(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Body() dto: UpdateCustomRoleDto,
  ) {
    return this.orgsService.updateCustomRole(id, roleId, user.id, dto);
  }

  @Delete(':id/roles/:roleId')
  deleteRole(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ) {
    return this.orgsService.deleteCustomRole(id, roleId, user.id);
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  @Post(':id/events')
  createEvent(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateOrgEventDto,
  ) {
    return this.orgsService.createEvent(id, user.id, dto);
  }

  @Post(':id/events/bulk')
  bulkCreateEvents(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: BulkCreateOrgEventsDto,
  ) {
    return this.orgsService.bulkCreateEvents(id, user.id, dto);
  }

  @Get(':id/events')
  findEvents(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('month') month?: string,
  ) {
    return this.orgsService.findEvents(id, user.id, month);
  }

  @Delete(':id/events/:eventId')
  deleteEvent(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('eventId') eventId: string,
  ) {
    return this.orgsService.deleteEvent(id, eventId, user.id);
  }

  // ── RSVPs ──────────────────────────────────────────────────────────────────

  @Post(':id/events/:eventId/rsvp')
  upsertRsvp(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('eventId') eventId: string,
    @Body() dto: RsvpDto,
  ) {
    return this.orgsService.upsertRsvp(id, eventId, user.id, dto);
  }

  @Get(':id/events/:eventId/rsvp')
  getEventRsvps(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('eventId') eventId: string,
  ) {
    return this.orgsService.getEventRsvps(id, eventId, user.id);
  }

  // ── Venues ─────────────────────────────────────────────────────────────────

  @Post(':id/venues')
  createVenue(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateVenueDto,
  ) {
    return this.orgsService.createVenue(id, user.id, dto);
  }

  @Get(':id/venues')
  findVenues(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orgsService.findVenues(id, user.id);
  }

  @Delete(':id/venues/:venueId')
  deleteVenue(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('venueId') venueId: string,
  ) {
    return this.orgsService.deleteVenue(id, venueId, user.id);
  }

  // ── Announcements ──────────────────────────────────────────────────────────

  @Post(':id/announcements')
  createAnnouncement(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.orgsService.createAnnouncement(id, user.id, dto);
  }

  @Get(':id/announcements')
  findAnnouncements(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orgsService.findAnnouncements(id, user.id);
  }

  @Delete(':id/announcements/:announcementId')
  deleteAnnouncement(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('announcementId') announcementId: string,
  ) {
    return this.orgsService.deleteAnnouncement(id, announcementId, user.id);
  }

  // ── ICS Export ─────────────────────────────────────────────────────────────

  @Get(':id/calendar.ics')
  async exportIcs(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const ics = await this.orgsService.generateIcs(id, user.id);
    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="kidschedule-${id}.ics"`,
    });
    res.send(ics);
  }
}
