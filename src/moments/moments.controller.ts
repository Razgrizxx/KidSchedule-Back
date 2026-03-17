import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MomentsService } from './moments.service';
import { CreateMomentDto } from './dto/moment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/moments')
export class MomentsController {
  constructor(private momentsService: MomentsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateMomentDto,
  ) {
    return this.momentsService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('childId') childId?: string,
  ) {
    return this.momentsService.findAll(familyId, user.id, childId);
  }

  @Delete(':momentId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('momentId') momentId: string,
  ) {
    return this.momentsService.remove(familyId, momentId, user.id);
  }
}
