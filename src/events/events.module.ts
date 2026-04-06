import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [FamilyModule, EventEmitterModule, MulterModule.register({})],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
