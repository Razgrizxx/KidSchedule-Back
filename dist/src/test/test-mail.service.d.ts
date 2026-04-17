import { ConfigService } from '@nestjs/config';
export declare class TestMailService {
    private config;
    private readonly logger;
    private transporter;
    private readonly from;
    constructor(config: ConfigService);
    verify(): Promise<{
        ok: boolean;
        error?: string;
    }>;
    sendTest(to: string, subject: string, body: string): Promise<{
        messageId: string;
    }>;
}
