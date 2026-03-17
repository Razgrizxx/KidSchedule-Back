import { Module } from '@nestjs/common';
import { MomentsService } from './moments.service';
import { MomentsController } from './moments.controller';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [FamilyModule],
  providers: [MomentsService],
  controllers: [MomentsController],
})
export class MomentsModule {}
