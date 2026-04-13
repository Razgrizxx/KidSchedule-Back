import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IcalService } from './ical.service';
import { IcalController } from './ical.controller';

@Module({
  imports:     [PrismaModule],
  controllers: [IcalController],
  providers:   [IcalService],
})
export class IcalModule {}
