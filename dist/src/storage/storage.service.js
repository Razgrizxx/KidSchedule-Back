"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
function uploadsRoot() {
    return process.env.NODE_ENV === 'production'
        ? '/home/christian/uploads'
        : (0, path_1.join)(process.cwd(), 'uploads');
}
let LocalStorageService = class LocalStorageService {
    async upload(file, folder, _resourceType) {
        const sub = folder.replace(/^kidschedule\//, '');
        const dir = (0, path_1.join)(uploadsRoot(), sub);
        if (!(0, fs_1.existsSync)(dir))
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        const filename = `${unique}${(0, path_1.extname)(file.originalname)}`;
        await (0, promises_1.writeFile)((0, path_1.join)(dir, filename), file.buffer);
        const public_id = `${sub}/${filename}`;
        const secure_url = `/uploads/${public_id}`;
        return { secure_url, public_id };
    }
    async delete(publicId) {
        await (0, promises_1.unlink)((0, path_1.join)(uploadsRoot(), publicId)).catch(() => { });
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = __decorate([
    (0, common_1.Injectable)()
], LocalStorageService);
//# sourceMappingURL=storage.service.js.map