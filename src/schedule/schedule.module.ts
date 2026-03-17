import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleGeneratorService } from './schedule-generator.service';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [FamilyModule],
  providers: [ScheduleService, ScheduleGeneratorService],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
