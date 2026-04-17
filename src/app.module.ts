import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { HealthModule } from './health/health.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { HandoffsModule } from './handoffs/handoffs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmergencyContactsModule } from './emergency-contacts/emergency-contacts.module';
import { DocumentsModule } from './documents/documents.module';
import { LocalStorageModule } from './storage/storage.module';
import { TestModule } from './test/test.module';

@Module({
  providers: [
    // Apply ThrottlerGuard globally — every route gets the default limit unless overridden
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    LocalStorageModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,   // 1 minute window
        limit: 100,    // 100 req/min per IP — general protection
      },
      {
        name: 'ai',
        ttl: 60_000,
        limit: 10,     // 10 req/min per IP for AI endpoints
      },
    ]),
    NotificationsModule,
    AuditModule,
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
    HealthModule,
    ReportsModule,
    HandoffsModule,
    DashboardModule,
    EmergencyContactsModule,
    DocumentsModule,
    TestModule,
  ],
})
export class AppModule {}
