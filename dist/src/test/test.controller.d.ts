import { TestMailService } from './test-mail.service';
declare class SendTestEmailDto {
    to: string;
    subject: string;
    body: string;
}
export declare class TestController {
    private readonly mail;
    constructor(mail: TestMailService);
    verifySmtp(): Promise<{
        ok: boolean;
        error?: string;
    }>;
    sendEmail(dto: SendTestEmailDto): Promise<{
        messageId: string;
        ok: boolean;
    }>;
    upload(file: Express.Multer.File): {
        ok: boolean;
        url: string;
        originalName: string;
        size: number;
        mimetype: string;
        savedTo: string;
    };
}
export {};
