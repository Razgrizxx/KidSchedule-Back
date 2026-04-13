import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { FamilyModule } from '../family/family.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [FamilyModule, CloudinaryModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
