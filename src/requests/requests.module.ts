import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [FamilyModule],
  providers: [RequestsService],
  controllers: [RequestsController],
})
export class RequestsModule {}
