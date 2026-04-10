import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TravelService } from './travel.service';
import { CreateTravelNoticeDto } from './dto/travel-notice.dto';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/travel')
export class TravelController {
  constructor(private readonly service: TravelService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @Body() dto: CreateTravelNoticeDto,
  ) {
    return this.service.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@Param('familyId') familyId: string) {
    return this.service.findAll(familyId);
  }

  @Patch(':id/acknowledge')
  acknowledge(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @Param('id') id: string,
  ) {
    return this.service.acknowledge(familyId, id, user.id);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(familyId, id, user.id);
  }
}
