import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PublicOrgController } from './public-org.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [PrismaModule, ConfigModule, StripeModule],
  providers: [OrganizationsService],
  controllers: [OrganizationsController, PublicOrgController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
