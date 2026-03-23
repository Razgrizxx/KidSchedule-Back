import { Controller, Get, Param } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

/** Public endpoints — no JWT required */
@Controller('public/organizations')
export class PublicOrgController {
  constructor(private orgsService: OrganizationsService) {}

  @Get(':id/calendar')
  getPublicCalendar(@Param('id') id: string) {
    return this.orgsService.getPublicCalendar(id);
  }
}
