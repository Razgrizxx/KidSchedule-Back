import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EmergencyContactsService } from './emergency-contacts.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto/emergency-contact.dto';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/emergency-contacts')
export class EmergencyContactsController {
  constructor(private readonly service: EmergencyContactsService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @Body() dto: CreateEmergencyContactDto,
  ) {
    return this.service.create(familyId, user.id, dto);
  }

  @Get()
  findAll(
    @Param('familyId') familyId: string,
    @Query('childId') childId?: string,
  ) {
    return this.service.findAll(familyId, childId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyContactDto,
  ) {
    return this.service.update(familyId, id, user.id, dto);
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
