"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandoffsModule = void 0;
const common_1 = require("@nestjs/common");
const handoffs_service_1 = require("./handoffs.service");
const handoffs_controller_1 = require("./handoffs.controller");
const family_module_1 = require("../family/family.module");
const prisma_module_1 = require("../prisma/prisma.module");
let HandoffsModule = class HandoffsModule {
};
exports.HandoffsModule = HandoffsModule;
exports.HandoffsModule = HandoffsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, family_module_1.FamilyModule],
        providers: [handoffs_service_1.HandoffsService],
        controllers: [handoffs_controller_1.HandoffsController],
    })
], HandoffsModule);
//# sourceMappingURL=handoffs.module.js.map