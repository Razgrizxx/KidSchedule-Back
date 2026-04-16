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
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
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
    (0, common_1.Controller)('test')
], TestController);
//# sourceMappingURL=test.controller.js.map