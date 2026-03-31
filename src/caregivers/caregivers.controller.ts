import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CaregiversService } from './caregivers.service';
import { CreateCaregiverDto, UpdateCaregiverDto } from './dto/caregiver.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/caregivers')
export class CaregiversController {
  constructor(private caregiversService: CaregiversService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateCaregiverDto,
  ) {
    return this.caregiversService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('familyId') familyId: string) {
    return this.caregiversService.findAll(familyId, user.id);
  }

  @Get(':caregiverId')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('caregiverId') caregiverId: string,
  ) {
    return this.caregiversService.findOne(familyId, caregiverId, user.id);
  }

  @Patch(':caregiverId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('caregiverId') caregiverId: string,
    @Body() dto: UpdateCaregiverDto,
  ) {
    return this.caregiversService.update(familyId, caregiverId, user.id, dto);
  }

  @Delete(':caregiverId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('caregiverId') caregiverId: string,
  ) {
    return this.caregiversService.remove(familyId, caregiverId, user.id);
  }

  @Post(':caregiverId/assign/:childId')
  assignToChild(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('caregiverId') caregiverId: string,
    @Param('childId') childId: string,
  ) {
    return this.caregiversService.assignToChild(
      familyId,
      caregiverId,
      childId,
      user.id,
    );
  }

  @Delete(':caregiverId/assign/:childId')
  unassignFromChild(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('caregiverId') caregiverId: string,
    @Param('childId') childId: string,
  ) {
    return this.caregiversService.unassignFromChild(
      familyId,
      caregiverId,
      childId,
      user.id,
    );
  }
}

@Controller('caregivers/invite')
export class CaregiverInviteController {
  constructor(private caregiversService: CaregiversService) {}

  @Get(':token')
  resolveToken(@Param('token') token: string) {
    return this.caregiversService.resolveByToken(token);
  }
}
