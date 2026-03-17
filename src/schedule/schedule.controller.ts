import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/schedule.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/schedules')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.scheduleService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('familyId') familyId: string) {
    return this.scheduleService.findAll(familyId, user.id);
  }

  @Get('calendar')
  getCalendar(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.scheduleService.getCalendar(familyId, user.id, year, month);
  }

  @Post(':scheduleId/override')
  overrideDay(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() body: { date: string; custodianId: string },
  ) {
    return this.scheduleService.overrideDay(
      familyId,
      scheduleId,
      body.date,
      body.custodianId,
      user.id,
    );
  }
}
