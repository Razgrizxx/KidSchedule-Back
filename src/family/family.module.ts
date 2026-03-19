import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';

@Module({
  imports: [ConfigModule],
  providers: [FamilyService],
  controllers: [FamilyController],
  exports: [FamilyService],
})
export class FamilyModule {}
