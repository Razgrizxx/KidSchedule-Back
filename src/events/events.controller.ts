import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { BulkImportDto, CreateEventDto, UpdateEventDto } from './dto/event.dto';
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

  @Get('holidays')
  getHolidays(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('year') yearStr?: string,
    @Query('country') country?: string,
  ) {
    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    return this.eventsService.getHolidays(familyId, user.id, year, country);
  }

  @Post('extract-from-image')
  @UseInterceptors(FileInterceptor('image'))
  extractFromImage(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.eventsService.extractFromImage(familyId, user.id, file);
  }

  @Post('bulk')
  bulkCreate(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: BulkImportDto,
  ) {
    return this.eventsService.bulkCreate(familyId, user.id, dto);
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
