import { Module } from '@nestjs/common';
import { MediationService } from './mediation.service';
import { MediationController } from './mediation.controller';
import { FamilyModule } from '../family/family.module';
import { ClaudeModule } from '../claude/claude.module';
import { MessagingModule } from '../messaging/messaging.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [FamilyModule, ClaudeModule, MessagingModule, StripeModule],
  providers: [MediationService],
  controllers: [MediationController],
})
export class MediationModule {}
