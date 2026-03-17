import { Module } from '@nestjs/common';
import { CaregiversService } from './caregivers.service';
import {
  CaregiversController,
  CaregiverInviteController,
} from './caregivers.controller';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [FamilyModule],
  providers: [CaregiversService],
  controllers: [CaregiversController, CaregiverInviteController],
})
export class CaregiversModule {}
