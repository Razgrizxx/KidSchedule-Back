import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import {
  CreateChangeRequestDto,
  RespondChangeRequestDto,
} from './dto/change-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/requests')
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateChangeRequestDto,
  ) {
    return this.requestsService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('familyId') familyId: string) {
    return this.requestsService.findAll(familyId, user.id);
  }

  @Post(':requestId/respond')
  respond(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('requestId') requestId: string,
    @Body() dto: RespondChangeRequestDto,
  ) {
    return this.requestsService.respond(familyId, requestId, user.id, dto);
  }
}
