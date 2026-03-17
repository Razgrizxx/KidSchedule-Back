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
import { ChildrenService } from './children.service';
import { CreateChildDto, UpdateChildDto } from './dto/child.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/children')
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateChildDto,
  ) {
    return this.childrenService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('familyId') familyId: string) {
    return this.childrenService.findAll(familyId, user.id);
  }

  @Get(':childId')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('childId') childId: string,
  ) {
    return this.childrenService.findOne(familyId, childId, user.id);
  }

  @Patch(':childId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('childId') childId: string,
    @Body() dto: UpdateChildDto,
  ) {
    return this.childrenService.update(familyId, childId, user.id, dto);
  }

  @Delete(':childId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('childId') childId: string,
  ) {
    return this.childrenService.remove(familyId, childId, user.id);
  }
}
