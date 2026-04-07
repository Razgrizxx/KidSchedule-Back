import { Module } from '@nestjs/common';
import { HandoffsService } from './handoffs.service';
import { HandoffsController } from './handoffs.controller';
import { FamilyModule } from '../family/family.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, FamilyModule],
  providers: [HandoffsService],
  controllers: [HandoffsController],
})
export class HandoffsModule {}
