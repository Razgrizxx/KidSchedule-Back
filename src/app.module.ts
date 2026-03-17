import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
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
import { SettingsModule } from './settings/settings.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST', 'smtp.mailtrap.io'),
          port: config.get<number>('SMTP_PORT', 2525),
          auth: {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"KidSchedule" <${config.get<string>('SMTP_FROM', 'noreply@kidschedule.app')}>`,
        },
      }),
    }),
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
    SettingsModule,
    BlogModule,
  ],
})
export class AppModule {}
