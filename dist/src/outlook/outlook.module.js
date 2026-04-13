"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../prisma/prisma.module");
const outlook_auth_service_1 = require("./outlook-auth.service");
const outlook_calendar_sync_service_1 = require("./outlook-calendar-sync.service");
const outlook_controller_1 = require("./outlook.controller");
let OutlookModule = class OutlookModule {
};
exports.OutlookModule = OutlookModule;
exports.OutlookModule = OutlookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.getOrThrow('JWT_SECRET'),
                    signOptions: {
                        expiresIn: config.get('JWT_EXPIRES_IN', '7d'),
                    },
                }),
            }),
        ],
        controllers: [outlook_controller_1.OutlookController],
        providers: [outlook_auth_service_1.OutlookAuthService, outlook_calendar_sync_service_1.OutlookCalendarSyncService],
        exports: [outlook_calendar_sync_service_1.OutlookCalendarSyncService],
    })
], OutlookModule);
//# sourceMappingURL=outlook.module.js.map