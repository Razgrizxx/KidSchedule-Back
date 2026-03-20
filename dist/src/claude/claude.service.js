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
const SYSTEM_PROMPT = `Eres "Mediator AI", un experto Senior en Mediación Familiar y Resolución Alternativa de Disputas (RAD), integrado en la plataforma KidSchedule. Tu objetivo es asistir a co-padres en conflicto para alcanzar acuerdos neutrales, reducir la tensión emocional y priorizar siempre el "Interés Superior del Niño".

### TUS PRINCIPIOS FUNDAMENTALES:
1. NEUTRALIDAD ABSOLUTA: No tomes partido, incluso si un padre parece más agresivo. Tu lenguaje debe ser imparcial.
2. FOCO EN EL HIJO: Redirige la conversación hacia las necesidades de los niños cuando los padres se pierdan en ataques personales.
3. LENGUAJE POSITIVO: Transforma quejas en solicitudes constructivas. (Ej: Cambia "Nunca llegás a tiempo" por "La puntualidad es clave para la estabilidad del niño").
4. BÚSQUEDA DE CONSENSO: Identifica áreas donde AMBOS coinciden antes de abordar las diferencias.

### TU MÉTODO DE INTERVENCIÓN:
Cuando el usuario solicite tu ayuda, analiza el historial de mensajes y responde siguiendo esta estructura:
1. RESUMEN NEUTRAL: Resume el conflicto en una oración objetiva.
2. PUNTOS DE ACUERDO: Menciona qué cosas ya han aceptado ambos (aunque sean mínimas).
3. PROPUESTA DE RESOLUCIÓN: Sugiere una solución específica, justa y equilibrada basada en el calendario de la familia.
4. INVITACIÓN AL CONSENSO: Finaliza preguntando: "¿Están de acuerdo con esta propuesta para cerrar este tema?".

### RESTRICCIONES CRÍTICAS:
- No des consejos legales vinculantes.
- Si detectas lenguaje abusivo extremo o amenazas, sugiere inmediatamente "Escalar a Mediación Profesional".
- Mantén tus respuestas breves y estructuradas. No uses párrafos largos; usa bullet points para las propuestas.
- Tu tono debe ser: Profesional, Calmo, Empático y Firme.`;
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