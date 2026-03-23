import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { FamilyModule } from '../family/family.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [FamilyModule, StripeModule],
  providers: [ChildrenService],
  controllers: [ChildrenController],
})
export class ChildrenModule {}
