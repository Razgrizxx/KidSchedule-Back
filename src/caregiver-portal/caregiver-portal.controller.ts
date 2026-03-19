import {
  Controller,
  Get,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { CaregiverPortalService } from './caregiver-portal.service';

@Controller('caregiver-portal')
export class CaregiverPortalController {
  constructor(private service: CaregiverPortalService) {}

  @Get('dashboard')
  getDashboard(@Headers('x-caregiver-token') token: string) {
    if (!token) throw new BadRequestException('Missing x-caregiver-token header');
    return this.service.getDashboard(token);
  }
}
