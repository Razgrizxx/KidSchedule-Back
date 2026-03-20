import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { FamilyModule } from '../family/family.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [FamilyModule, MessagingModule],
  providers: [RequestsService],
  controllers: [RequestsController],
})
export class RequestsModule {}
