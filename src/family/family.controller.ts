import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families')
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFamilyDto) {
    return this.familyService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.familyService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.familyService.findOne(id, user.id);
  }

  @Post(':id/invite')
  invite(
    @CurrentUser() user: AuthUser,
    @Param('id') familyId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.familyService.inviteMember(familyId, user.id, dto);
  }

  @Post('invitations/:token/accept')
  acceptInvitation(
    @CurrentUser() user: AuthUser,
    @Param('token') token: string,
  ) {
    return this.familyService.acceptInvitation(token, user.id);
  }
}
