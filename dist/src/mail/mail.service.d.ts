import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private config;
    private readonly logger;
    private transporter;
    private readonly from;
    private readonly appUrl;
    constructor(config: ConfigService);
    sendEmail(to: string, subject: string, html: string): Promise<void>;
    sendWelcomeEmail(userEmail: string, firstName: string): Promise<void>;
    sendPasswordReset(userEmail: string, firstName: string, resetUrl: string): Promise<void>;
    sendMediatorInvite(opts: {
        toEmail: string;
        recipientName: string;
        inviterName: string;
        sessionTopic: string;
        viewUrl: string;
    }): Promise<void>;
    sendChangeRequestNotification(opts: {
        toEmail: string;
        requesterName: string;
        type: string;
        requestedDate: string;
    }): Promise<void>;
    sendMediationAlert(opts: {
        toEmail: string;
        recipientName: string;
        initiatorName: string;
        topic: string;
    }): Promise<void>;
    sendCoParentInvitation(opts: {
        toEmail: string;
        inviterName: string;
        familyName: string;
        childrenNames: string[];
        token: string;
    }): Promise<void>;
    sendCaregiverInvitation(opts: {
        toEmail: string;
        caregiverName: string;
        inviterName: string;
        familyName: string;
        childrenNames: string[];
        inviteToken: string;
        permissions: {
            canViewCalendar: boolean;
            canViewHealthInfo: boolean;
            canViewEmergencyContacts: boolean;
            canViewAllergies: boolean;
        };
    }): Promise<void>;
    sendJoinRequest(opts: {
        adminEmail: string;
        adminName: string;
        orgName: string;
        requesterName: string;
    }): Promise<void>;
    sendMemberApproved(opts: {
        toEmail: string;
        memberName: string;
        orgName: string;
    }): Promise<void>;
    sendOrgRosterInvite(opts: {
        toEmail: string;
        parentName: string;
        childName: string;
        orgName: string;
        portalUrl: string;
    }): Promise<void>;
}
