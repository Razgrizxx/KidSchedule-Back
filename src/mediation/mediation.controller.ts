import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MediationService } from './mediation.service';
import {
  CreateSessionDto,
  SendMessageDto,
  ProposeResolutionDto,
  RespondProposalDto,
} from './dto/mediation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/mediation')
export class MediationController {
  constructor(private mediationService: MediationService) {}

  @Get('stats')
  getStats(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
  ) {
    return this.mediationService.getStats(familyId, user.id);
  }

  @Post()
  createSession(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.mediationService.createSession(familyId, user.id, dto);
  }

  @Get()
  getSessions(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
  ) {
    return this.mediationService.getSessions(familyId, user.id);
  }

  @Get(':sessionId')
  getSession(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.mediationService.getSession(familyId, sessionId, user.id);
  }

  @Post(':sessionId/messages')
  sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.mediationService.sendMessage(familyId, sessionId, user.id, dto);
  }

  @Post(':sessionId/ask-ai')
  askAI(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.mediationService.askAI(familyId, sessionId, user.id);
  }

  @Post(':sessionId/propose')
  proposeResolution(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: ProposeResolutionDto,
  ) {
    return this.mediationService.proposeResolution(familyId, sessionId, user.id, dto);
  }

  @Patch(':sessionId/proposals/:proposalId/respond')
  respondProposal(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('sessionId') sessionId: string,
    @Param('proposalId') proposalId: string,
    @Body() dto: RespondProposalDto,
  ) {
    return this.mediationService.respondProposal(
      familyId, sessionId, proposalId, user.id, dto,
    );
  }

  @Patch(':sessionId/escalate')
  escalate(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.mediationService.escalate(familyId, sessionId, user.id);
  }

  @Get(':sessionId/court-report')
  getCourtReport(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.mediationService.getCourtReport(familyId, sessionId, user.id);
  }
}
