import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [FamilyModule, EventEmitterModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
