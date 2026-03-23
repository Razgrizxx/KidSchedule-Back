import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PublicOrgController } from './public-org.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OrganizationsService],
  controllers: [OrganizationsController, PublicOrgController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
