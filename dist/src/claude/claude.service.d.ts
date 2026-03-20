import { ConfigService } from '@nestjs/config';
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export declare class ClaudeService {
    private client;
    constructor(config: ConfigService);
    getMediationAdvice(history: ChatMessage[]): Promise<string>;
}
