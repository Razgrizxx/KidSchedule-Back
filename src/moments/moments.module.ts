import { Module } from '@nestjs/common';
import { MomentsService } from './moments.service';
import { MomentsController } from './moments.controller';
import { FamilyModule } from '../family/family.module';

import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [FamilyModule, StripeModule],
  providers: [MomentsService],
  controllers: [MomentsController],
})
export class MomentsModule {}
