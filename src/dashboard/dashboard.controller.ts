import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('today')
  getToday(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
  ) {
    return this.service.getToday(familyId, user.id);
  }
}
