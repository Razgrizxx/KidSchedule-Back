import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { FamilyModule } from '../family/family.module';


@Module({
  imports: [FamilyModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
