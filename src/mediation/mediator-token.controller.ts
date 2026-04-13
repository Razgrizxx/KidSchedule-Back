import { Controller, Get, Param } from '@nestjs/common';
import { MediationService } from './mediation.service';

/**
 * Public (no JWT) endpoint — resolves a mediator invite token to a
 * read-only view of the mediation session.
 */
@Controller('mediator')
export class MediatorTokenController {
  constructor(private mediationService: MediationService) {}

  @Get(':token')
  getByToken(@Param('token') token: string) {
    return this.mediationService.getSessionByToken(token);
  }
}
