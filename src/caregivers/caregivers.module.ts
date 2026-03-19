import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CaregiversService } from './caregivers.service';
import {
  CaregiversController,
  CaregiverInviteController,
} from './caregivers.controller';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [ConfigModule, FamilyModule],
  providers: [CaregiversService],
  controllers: [CaregiversController, CaregiverInviteController],
})
export class CaregiversModule {}
