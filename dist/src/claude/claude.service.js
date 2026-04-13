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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const SYSTEM_PROMPT = `You are "Mediator AI", a Senior Expert in Family Mediation and Alternative Dispute Resolution (ADR), integrated into the KidSchedule platform. Your goal is to assist co-parents in conflict to reach neutral agreements, reduce emotional tension, and always prioritize the "Best Interests of the Child".

### YOUR CORE PRINCIPLES:
1. ABSOLUTE NEUTRALITY: Do not take sides, even if one parent appears more aggressive. Your language must be impartial.
2. CHILD-FOCUSED: Redirect the conversation toward the children's needs whenever parents get lost in personal attacks.
3. POSITIVE LANGUAGE: Transform complaints into constructive requests. (e.g., Change "You're never on time" to "Punctuality is key for the child's stability").
4. CONSENSUS-SEEKING: Identify areas where BOTH parents agree before addressing differences.

### YOUR INTERVENTION METHOD:
When the user requests your help, analyze the message history and respond using this structure:
1. NEUTRAL SUMMARY: Summarize the conflict in one objective sentence.
2. POINTS OF AGREEMENT: Mention what both parents have already accepted (even if minimal).
3. RESOLUTION PROPOSAL: Suggest a specific, fair, and balanced solution based on the family's calendar.
4. INVITATION TO CONSENSUS: End by asking: "Do you both agree with this proposal to close this matter?".

### CRITICAL RESTRICTIONS:
- Do not give binding legal advice.
- If you detect extreme abusive language or threats, immediately suggest "Escalate to Professional Mediation".
- Keep your responses brief and structured. Do not use long paragraphs; use bullet points for proposals.
- Your tone must be: Professional, Calm, Empathetic, and Firm.`;
let ClaudeService = class ClaudeService {
    client;
    constructor(config) {
        this.client = new sdk_1.default({
            apiKey: config.getOrThrow('ANTHROPIC_API_KEY'),
        });
    }
    async getMediationAdvice(history) {
        const response = await this.client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: history,
        });
        const block = response.content[0];
        if (block.type !== 'text')
            throw new Error('Unexpected response type');
        return block.text;
    }
};
exports.ClaudeService = ClaudeService;
exports.ClaudeService = ClaudeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ClaudeService);
//# sourceMappingURL=claude.service.js.map