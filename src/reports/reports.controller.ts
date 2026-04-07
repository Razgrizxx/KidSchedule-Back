import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  generate(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @Body() dto: GenerateReportDto,
  ) {
    return this.reportsService.generate(familyId, user.id, dto);
  }
}
