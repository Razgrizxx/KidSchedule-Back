import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { AuditService } from './audit.service';
import { FamilyService } from '../family/family.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly familyService: FamilyService,
  ) {}

  @Get()
  async findAll(
    @Param('familyId') familyId: string,
    @CurrentUser() user: AuthUser,
    @Query('from')     from?:     string,
    @Query('to')       to?:       string,
    @Query('childId')  childId?:  string,
    @Query('action')   action?:   string,
    @Query('take')     take?:     string,
    @Query('cursor')   cursor?:   string,
  ) {
    await this.familyService.assertMember(familyId, user.id);

    return this.auditService.findAll(familyId, {
      from,
      to,
      childId,
      action: action as AuditAction | undefined,
      take:   take ? Math.min(Number(take), 100) : 50,
      cursor,
    });
  }
}
