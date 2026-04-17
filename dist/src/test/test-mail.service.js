"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TestMailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestMailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let TestMailService = TestMailService_1 = class TestMailService {
    config;
    logger = new common_1.Logger(TestMailService_1.name);
    transporter;
    from;
    constructor(config) {
        this.config = config;
        const host = config.getOrThrow('SMTP_HOST');
        const port = Number(config.getOrThrow('SMTP_PORT'));
        const user = config.getOrThrow('SMTP_USER');
        const pass = config.getOrThrow('SMTP_PASS');
        const secure = port === 465;
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        });
        this.from = `KidSchedule Test <${user}>`;
    }
    async verify() {
        try {
            await this.transporter.verify();
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    }
    async sendTest(to, subject, body) {
        const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#f1f5f9;margin:0;padding:40px 16px;">
        <table width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#2dd4bf,#0891b2);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">KidSchedule</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,.8);font-size:12px;">SMTP Test Email</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.7;">${body}</p>
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                Sent via SMTP sandbox — ${new Date().toISOString()}
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>`;
        this.logger.log(`[SMTP] Sending "${subject}" → ${to}`);
        const info = await this.transporter.sendMail({
            from: this.from,
            to,
            subject,
            html,
        });
        this.logger.log(`[SMTP] Sent — messageId: ${info.messageId}`);
        return { messageId: info.messageId };
    }
};
exports.TestMailService = TestMailService;
exports.TestMailService = TestMailService = TestMailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TestMailService);
//# sourceMappingURL=test-mail.service.js.map