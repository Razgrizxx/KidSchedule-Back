import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HandoffsService } from './handoffs.service';
import { CreateHandoffDto } from './dto/handoff.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/handoffs')
export class HandoffsController {
  constructor(private readonly handoffsService: HandoffsService) {}

  @Post()
  create(
    @Param('familyId') familyId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateHandoffDto,
  ) {
    return this.handoffsService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(
    @Param('familyId') familyId: string,
    @CurrentUser() user: AuthUser,
    @Query('childId') childId?: string,
    @Query('from')    from?:    string,
    @Query('to')      to?:      string,
    @Query('take')    take?:    string,
    @Query('cursor')  cursor?:  string,
  ) {
    return this.handoffsService.findAll(familyId, user.id, {
      childId,
      from,
      to,
      take:   take ? Math.min(Number(take), 100) : 30,
      cursor,
    });
  }

  @Patch(':handoffId/confirm')
  confirm(
    @Param('familyId')  familyId:  string,
    @Param('handoffId') handoffId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.handoffsService.confirm(familyId, handoffId, user.id);
  }

  @Delete(':handoffId')
  remove(
    @Param('familyId')  familyId:  string,
    @Param('handoffId') handoffId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.handoffsService.remove(familyId, handoffId, user.id);
  }
}
