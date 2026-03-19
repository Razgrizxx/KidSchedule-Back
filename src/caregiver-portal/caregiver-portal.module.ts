import { Module } from '@nestjs/common';
import { CaregiverPortalController } from './caregiver-portal.controller';
import { CaregiverPortalService } from './caregiver-portal.service';

@Module({
  controllers: [CaregiverPortalController],
  providers: [CaregiverPortalService],
})
export class CaregiverPortalModule {}
