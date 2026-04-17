"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const class_validator_1 = require("class-validator");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const throttler_1 = require("@nestjs/throttler");
const test_mail_service_1 = require("./test-mail.service");
class SendTestEmailDto {
    to;
    subject;
    body;
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SendTestEmailDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], SendTestEmailDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], SendTestEmailDto.prototype, "body", void 0);
function getUploadRoot() {
    return process.env.NODE_ENV === 'production'
        ? '/home/christian/uploads'
        : (0, path_1.join)(process.cwd(), 'uploads');
}
const diskStorageConfig = (0, multer_1.diskStorage)({
    destination(_req, file, cb) {
        const isImage = file.mimetype.startsWith('image/');
        const sub = isImage ? 'images' : 'docs';
        const dest = (0, path_1.join)(getUploadRoot(), sub);
        if (!(0, fs_1.existsSync)(dest))
            (0, fs_1.mkdirSync)(dest, { recursive: true });
        cb(null, dest);
    },
    filename(_req, file, cb) {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
    },
});
let TestController = class TestController {
    mail;
    constructor(mail) {
        this.mail = mail;
    }
    verifySmtp() {
        return this.mail.verify();
    }
    async sendEmail(dto) {
        const result = await this.mail.sendTest(dto.to, dto.subject, dto.body);
        return { ok: true, ...result };
    }
    upload(file) {
        if (!file)
            throw new common_1.BadRequestException('No file received');
        const isImage = file.mimetype.startsWith('image/');
        const sub = isImage ? 'images' : 'docs';
        const url = `/uploads/${sub}/${file.filename}`;
        return {
            ok: true,
            url,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            savedTo: file.path,
        };
    }
};
exports.TestController = TestController;
__decorate([
    (0, common_1.Get)('email/verify'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestController.prototype, "verifySmtp", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { ttl: 60_000, limit: 5 } }),
    (0, common_1.Post)('email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendTestEmailDto]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: diskStorageConfig,
        limits: { fileSize: 20 * 1024 * 1024 },
        fileFilter(_req, file, cb) {
            const allowed = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif',
                'application/pdf',
            ];
            if (allowed.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException(`File type not allowed: ${file.mimetype}`), false);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "upload", null);
exports.TestController = TestController = __decorate([
    (0, common_1.Controller)('test'),
    __metadata("design:paramtypes", [test_mail_service_1.TestMailService])
], TestController);
//# sourceMappingURL=test.controller.js.map