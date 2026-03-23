import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionGuard } from './subscription.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [StripeService, SubscriptionService, SubscriptionGuard],
  controllers: [StripeController],
  exports: [StripeService, SubscriptionService, SubscriptionGuard],
})
export class StripeModule {}
