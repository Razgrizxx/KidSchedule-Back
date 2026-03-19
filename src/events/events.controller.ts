import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('month') month?: string,
  ) {
    return this.eventsService.findAll(familyId, user.id, month);
  }

  @Patch(':eventId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(familyId, eventId, user.id, dto);
  }

  @Delete(':eventId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.eventsService.remove(familyId, eventId, user.id);
  }
}
