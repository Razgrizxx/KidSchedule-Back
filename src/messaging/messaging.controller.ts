import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PhoneVerifiedGuard } from '../common/guards/phone-verified.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard, PhoneVerifiedGuard)
@Controller('families/:familyId/messages')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Post()
  send(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.send(familyId, user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.messagingService.findAll(
      familyId,
      user.id,
      cursor,
      take ? parseInt(take) : 50,
    );
  }

  @Get('verify-chain')
  verifyChain(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
  ) {
    return this.messagingService.verifyChain(familyId, user.id);
  }

  @Post('mark-read')
  markRead(@CurrentUser() user: AuthUser, @Param('familyId') familyId: string) {
    return this.messagingService.markRead(familyId, user.id);
  }
}
