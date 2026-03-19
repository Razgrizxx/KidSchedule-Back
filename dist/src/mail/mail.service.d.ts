import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private mailer;
    private readonly logger;
    constructor(mailer: MailerService);
    sendCoParentInvitation(opts: {
        toEmail: string;
        inviterName: string;
        familyName: string;
        childrenNames: string[];
        token: string;
        appUrl: string;
    }): Promise<void>;
    sendCaregiverInvitation(opts: {
        toEmail: string;
        caregiverName: string;
        inviterName: string;
        familyName: string;
        childrenNames: string[];
        inviteToken: string;
        appUrl: string;
        permissions: {
            canViewCalendar: boolean;
            canViewHealthInfo: boolean;
            canViewEmergencyContacts: boolean;
            canViewAllergies: boolean;
        };
    }): Promise<void>;
}
