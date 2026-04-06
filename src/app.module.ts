import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
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
import { CaregiverPortalModule } from './caregiver-portal/caregiver-portal.module';
import { EventsModule } from './events/events.module';
import { GoogleModule } from './google/google.module';
import { OutlookModule } from './outlook/outlook.module';
import { IcalModule } from './ical/ical.module';
import { AiModule } from './ai/ai.module';
import { MediationModule } from './mediation/mediation.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    MailModule,
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
    CaregiverPortalModule,
    EventsModule,
    GoogleModule,
    OutlookModule,
    IcalModule,
    AiModule,
    MediationModule,
    OrganizationsModule,
    StripeModule,
  ],
})
export class AppModule {}
