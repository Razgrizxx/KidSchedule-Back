"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_module_1 = require("./prisma/prisma.module");
const mail_module_1 = require("./mail/mail.module");
const auth_module_1 = require("./auth/auth.module");
const family_module_1 = require("./family/family.module");
const children_module_1 = require("./children/children.module");
const caregivers_module_1 = require("./caregivers/caregivers.module");
const schedule_module_1 = require("./schedule/schedule.module");
const messaging_module_1 = require("./messaging/messaging.module");
const requests_module_1 = require("./requests/requests.module");
const expenses_module_1 = require("./expenses/expenses.module");
const moments_module_1 = require("./moments/moments.module");
const settings_module_1 = require("./settings/settings.module");
const blog_module_1 = require("./blog/blog.module");
const caregiver_portal_module_1 = require("./caregiver-portal/caregiver-portal.module");
const events_module_1 = require("./events/events.module");
const google_module_1 = require("./google/google.module");
const outlook_module_1 = require("./outlook/outlook.module");
const ical_module_1 = require("./ical/ical.module");
const ai_module_1 = require("./ai/ai.module");
const mediation_module_1 = require("./mediation/mediation.module");
const organizations_module_1 = require("./organizations/organizations.module");
const stripe_module_1 = require("./stripe/stripe.module");
const health_module_1 = require("./health/health.module");
const reports_module_1 = require("./reports/reports.module");
const notifications_module_1 = require("./notifications/notifications.module");
const audit_module_1 = require("./audit/audit.module");
const handoffs_module_1 = require("./handoffs/handoffs.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const emergency_contacts_module_1 = require("./emergency-contacts/emergency-contacts.module");
const documents_module_1 = require("./documents/documents.module");
const travel_module_1 = require("./travel/travel.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            event_emitter_1.EventEmitterModule.forRoot(),
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
            mail_module_1.MailModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            family_module_1.FamilyModule,
            children_module_1.ChildrenModule,
            caregivers_module_1.CaregiversModule,
            schedule_module_1.ScheduleModule,
            messaging_module_1.MessagingModule,
            requests_module_1.RequestsModule,
            expenses_module_1.ExpensesModule,
            moments_module_1.MomentsModule,
            settings_module_1.SettingsModule,
            blog_module_1.BlogModule,
            caregiver_portal_module_1.CaregiverPortalModule,
            events_module_1.EventsModule,
            google_module_1.GoogleModule,
            outlook_module_1.OutlookModule,
            ical_module_1.IcalModule,
            ai_module_1.AiModule,
            mediation_module_1.MediationModule,
            organizations_module_1.OrganizationsModule,
            stripe_module_1.StripeModule,
            health_module_1.HealthModule,
            reports_module_1.ReportsModule,
            handoffs_module_1.HandoffsModule,
            dashboard_module_1.DashboardModule,
            emergency_contacts_module_1.EmergencyContactsModule,
            documents_module_1.DocumentsModule,
            travel_module_1.TravelModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map