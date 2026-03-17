import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FamilyModule } from './family/family.module';
import { ChildrenModule } from './children/children.module';
import { CaregiversModule } from './caregivers/caregivers.module';
import { ScheduleModule } from './schedule/schedule.module';
import { MessagingModule } from './messaging/messaging.module';
import { RequestsModule } from './requests/requests.module';
import { ExpensesModule } from './expenses/expenses.module';
import { MomentsModule } from './moments/moments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FamilyModule,
    ChildrenModule,
    CaregiversModule,
    ScheduleModule,
    MessagingModule,
    RequestsModule,
    ExpensesModule,
    MomentsModule,
  ],
})
export class AppModule {}
