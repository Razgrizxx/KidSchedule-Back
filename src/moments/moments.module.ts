import { Module } from '@nestjs/common';
import { MomentsService } from './moments.service';
import { MomentsController } from './moments.controller';
import { FamilyModule } from '../family/family.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [FamilyModule, CloudinaryModule, StripeModule],
  providers: [MomentsService],
  controllers: [MomentsController],
})
export class MomentsModule {}
