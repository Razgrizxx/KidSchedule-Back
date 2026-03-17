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
const mailer_1 = require("@nestjs-modules/mailer");
const prisma_module_1 = require("./prisma/prisma.module");
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
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    transport: {
                        host: config.get('SMTP_HOST', 'smtp.mailtrap.io'),
                        port: config.get('SMTP_PORT', 2525),
                        auth: {
                            user: config.get('SMTP_USER'),
                            pass: config.get('SMTP_PASS'),
                        },
                    },
                    defaults: {
                        from: `"KidSchedule" <${config.get('SMTP_FROM', 'noreply@kidschedule.app')}>`,
                    },
                }),
            }),
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
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map