import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [PrismaModule, FamilyModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
