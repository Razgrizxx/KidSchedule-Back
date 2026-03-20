import { Module } from '@nestjs/common';
import { MomentsService } from './moments.service';
import { MomentsController } from './moments.controller';
import { FamilyModule } from '../family/family.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [FamilyModule, CloudinaryModule],
  providers: [MomentsService],
  controllers: [MomentsController],
})
export class MomentsModule {}
