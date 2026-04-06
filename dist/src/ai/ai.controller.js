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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let AiController = class AiController {
    anthropic = new sdk_1.default();
    async analyzeTone(body) {
        const text = (body.text ?? '').trim();
        if (!text)
            return { score: 'neutral', issues: [], rewrite: null };
        const response = await this.anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 512,
            messages: [
                {
                    role: 'user',
                    content: `You are a co-parenting communication coach. Analyze this message for hostile language, accusations, sarcasm, passive-aggression, blame, or emotionally charged wording that could escalate conflict.

Return ONLY a raw JSON object — no markdown, no code blocks:
{
  "score": "neutral" | "mild" | "hostile",
  "issues": ["short description of each issue found"],
  "rewrite": "calm, neutral rewrite of the message, or null if already neutral"
}

Rules:
- "neutral": no issues, rewrite = null
- "mild": subtle tension but not overtly hostile
- "hostile": clear aggression, accusations, or inflammatory language
- Keep the rewrite concise and preserve the original intent
- Write issues in the same language as the original message

Message to analyze:
"""
${text}
"""`,
                },
            ],
        });
        const raw = response.content[0].text.trim();
        const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
        try {
            const result = JSON.parse(clean);
            return {
                score: result.score ?? 'neutral',
                issues: Array.isArray(result.issues) ? result.issues : [],
                rewrite: result.rewrite ?? null,
            };
        }
        catch {
            return { score: 'neutral', issues: [], rewrite: null };
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('tone-analysis'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analyzeTone", null);
exports.AiController = AiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai')
], AiController);
//# sourceMappingURL=ai.controller.js.map