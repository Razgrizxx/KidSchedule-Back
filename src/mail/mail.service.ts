import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private config: ConfigService) {
    const host = config.getOrThrow<string>('SMTP_HOST');
    const port = Number(config.getOrThrow<string>('SMTP_PORT'));
    const user = config.getOrThrow<string>('SMTP_USER');
    const pass = config.getOrThrow<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    this.from = `KidSchedule <${user}>`;
    this.appUrl = config.get<string>('FRONTEND_URL', 'http://localhost:5173');

    this.logger.log(`Email provider: SMTP (${host}:${port})`);
  }

  // ── Generic send ──────────────────────────────────────────────────────────

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      this.logger.log(`[SMTP] Sending "${subject}" → ${to}`);
      const info = await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`[SMTP] Sent — ${info.messageId} → ${to}`);
    } catch (err) {
      this.logger.error(
        `[SMTP] Failed to send "${subject}" → ${to}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  // ── Auth emails ───────────────────────────────────────────────────────────

  async sendWelcomeEmail(userEmail: string, firstName: string): Promise<void> {
    await this.sendEmail(
      userEmail,
      'Welcome to KidSchedule!',
      buildWelcomeEmail({ firstName, appUrl: this.appUrl }),
    );
  }

  async sendPasswordReset(userEmail: string, firstName: string, resetUrl: string): Promise<void> {
    await this.sendEmail(
      userEmail,
      'Reset your KidSchedule password',
      buildPasswordResetEmail({ firstName, resetUrl }),
    );
  }

  async sendMediatorInvite(opts: {
    toEmail: string;
    recipientName: string;
    inviterName: string;
    sessionTopic: string;
    viewUrl: string;
  }): Promise<void> {
    await this.sendEmail(
      opts.toEmail,
      `${opts.inviterName} invited you as a mediator on KidSchedule`,
      `<p>Hello ${opts.recipientName},</p>
       <p><strong>${opts.inviterName}</strong> invited you to participate as a mediator in the session <em>${opts.sessionTopic}</em>.</p>
       <p><a href="${opts.viewUrl}" style="background:#7c3aed;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">View session →</a></p>
       <p style="color:#94a3b8;font-size:12px;">This link is personal. Do not share it with third parties.</p>`,
    );
  }

  // ── Feature emails ────────────────────────────────────────────────────────

  async sendChangeRequestNotification(opts: {
    toEmail: string;
    requesterName: string;
    type: string;
    requestedDate: string;
  }): Promise<void> {
    await this.sendEmail(
      opts.toEmail,
      `${opts.requesterName} sent you a custody request`,
      buildChangeRequestEmail({ ...opts, appUrl: this.appUrl }),
    );
  }

  async sendMediationAlert(opts: {
    toEmail: string;
    recipientName: string;
    initiatorName: string;
    topic: string;
  }): Promise<void> {
    await this.sendEmail(
      opts.toEmail,
      `${opts.initiatorName} started a mediation session`,
      buildMediationAlertEmail({ ...opts, appUrl: this.appUrl }),
    );
  }

  // ── Invitation emails ─────────────────────────────────────────────────────

  async sendCoParentInvitation(opts: {
    toEmail: string;
    inviterName: string;
    familyName: string;
    childrenNames: string[];
    token: string;
  }): Promise<void> {
    const joinUrl = `${this.appUrl}/#/join?token=${opts.token}`;
    const childrenText = opts.childrenNames.length > 0 ? opts.childrenNames.join(', ') : 'your child(ren)';
    await this.sendEmail(
      opts.toEmail,
      `${opts.inviterName} invited you to co-manage custody on KidSchedule`,
      buildCoParentEmail({ inviterName: opts.inviterName, familyName: opts.familyName, childrenText, joinUrl }),
    );
  }

  async sendCaregiverInvitation(opts: {
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
  }): Promise<void> {
    const accessUrl = `${this.appUrl}/#/caregiver-access?token=${opts.inviteToken}`;
    const childrenText = opts.childrenNames.length > 0 ? opts.childrenNames.join(', ') : 'a child';
    const permList = [
      opts.permissions.canViewCalendar && 'Custody calendar',
      opts.permissions.canViewHealthInfo && 'Child information',
      opts.permissions.canViewEmergencyContacts && 'Emergency contacts',
      opts.permissions.canViewAllergies && 'Allergies and medical notes',
    ].filter(Boolean) as string[];

    await this.sendEmail(
      opts.toEmail,
      `${opts.inviterName} granted you caregiver access on KidSchedule`,
      buildCaregiverEmail({
        caregiverName: opts.caregiverName,
        inviterName: opts.inviterName,
        familyName: opts.familyName,
        childrenText,
        permList,
        accessUrl,
      }),
    );
  }

  async sendJoinRequest(opts: {
    adminEmail: string;
    adminName: string;
    orgName: string;
    requesterName: string;
  }): Promise<void> {
    const dashboardUrl = `${this.appUrl}/dashboard/organizations`;
    await this.sendEmail(
      opts.adminEmail,
      `${opts.requesterName} wants to join ${opts.orgName} on KidSchedule`,
      buildJoinRequestEmail({ ...opts, dashboardUrl }),
    );
  }

  async sendMemberApproved(opts: {
    toEmail: string;
    memberName: string;
    orgName: string;
  }): Promise<void> {
    const orgUrl = `${this.appUrl}/dashboard/organizations`;
    await this.sendEmail(
      opts.toEmail,
      `Your request to join ${opts.orgName} was approved`,
      buildMemberApprovedEmail({ ...opts, orgUrl }),
    );
  }

  async sendOrgRosterInvite(opts: {
    toEmail: string;
    parentName: string;
    childName: string;
    orgName: string;
    portalUrl: string;
  }): Promise<void> {
    await this.sendEmail(
      opts.toEmail,
      `View the ${opts.orgName} calendar on KidSchedule`,
      buildOrgRosterInviteEmail(opts),
    );
  }
}

// ── Shared layout ─────────────────────────────────────────────────────────────

function layout(opts: {
  headerGradient: string;
  headerIcon: string;
  headerTitle: string;
  headerSubtitle: string;
  body: string;
}): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);">

        <!-- Header -->
        <tr>
          <td style="background:${opts.headerGradient};padding:40px;text-align:center;">
            <div style="display:inline-block;width:64px;height:64px;line-height:64px;text-align:center;background:rgba(255,255,255,.18);border-radius:16px;margin-bottom:16px;font-size:32px;">${opts.headerIcon}</div>
            <h1 style="margin:0 0 4px;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-.3px;">KidSchedule</h1>
            <p style="margin:0;color:rgba(255,255,255,.8);font-size:13px;">${opts.headerSubtitle}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${opts.body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;background:#f8fafc;">
            <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;">© ${year} KidSchedule · The family schedule that actually works</p>
            <p style="margin:0;color:#cbd5e1;font-size:11px;">If you were not expecting this email, you can safely ignore it.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(label: string, href: string, color: string): string {
  return `<div style="text-align:center;margin:32px 0 8px;">
    <a href="${href}" style="display:inline-block;background:${color};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:-.2px;">
      ${label}
    </a>
  </div>`;
}

// ── Email templates ───────────────────────────────────────────────────────────

function buildWelcomeEmail(p: { firstName: string; appUrl: string }): string {
  return layout({
    headerGradient: 'linear-gradient(135deg,#2dd4bf 0%,#0891b2 100%)',
    headerIcon: '📅',
    headerTitle: 'KidSchedule',
    headerSubtitle: "You're part of the family now!",
    body: `
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">Hello, ${p.firstName}!</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
        Your <strong style="color:#0f172a;">KidSchedule</strong> account is ready. You can now
        coordinate your children's custody schedule, manage shared expenses, communicate securely
        with your co-parent, and much more.
      </p>
      <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
        <p style="margin:0 0 10px;color:#0d9488;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;">Where to start?</p>
        <ul style="margin:0;padding:0 0 0 16px;color:#475569;font-size:14px;line-height:2;">
          <li>Set up the custody calendar</li>
          <li>Invite your co-parent</li>
          <li>Log shared expenses</li>
        </ul>
      </div>
      ${btn('Go to KidSchedule →', p.appUrl, '#0d9488')}
    `,
  });
}

function buildPasswordResetEmail(p: { firstName: string; resetUrl: string }): string {
  return layout({
    headerGradient: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
    headerIcon: '🔐',
    headerTitle: 'KidSchedule',
    headerSubtitle: 'Reset your password',
    body: `
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">Hello, ${p.firstName}</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
        We received a request to reset the password for your KidSchedule account.
        Click the button below — the link expires in <strong>1 hour</strong>.
      </p>
      ${btn('Reset password →', p.resetUrl, '#4f46e5')}
      <p style="margin:16px 0 0;color:#94a3b8;font-size:13px;text-align:center;">
        If you did not request this change, ignore this email. Your password will not be changed.
      </p>
    `,
  });
}

function buildChangeRequestEmail(p: {
  requesterName: string;
  type: string;
  requestedDate: string;
  appUrl: string;
}): string {
  const typeLabels: Record<string, string> = {
    SWAP: 'a day swap',
    EXTRA_DAY: 'an extra day',
    EXTRA_DAYS: 'extra days',
  };
  const typeLabel = typeLabels[p.type] ?? 'a custody request';
  const dashUrl = `${p.appUrl}/dashboard/requests`;

  return layout({
    headerGradient: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
    headerIcon: '📋',
    headerTitle: 'KidSchedule',
    headerSubtitle: 'New custody request',
    body: `
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">You have a new request</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
        <strong style="color:#0f172a;">${p.requesterName}</strong> sent you ${typeLabel}
        for <strong style="color:#0f172a;">${p.requestedDate}</strong>.
      </p>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6;">
          Review the request in the app and respond so you are both on the same page.
        </p>
      </div>
      ${btn('View request →', dashUrl, '#d97706')}
    `,
  });
}

function buildMediationAlertEmail(p: {
  recipientName: string;
  initiatorName: string;
  topic: string;
  appUrl: string;
}): string {
  const mediationUrl = `${p.appUrl}/dashboard/mediation`;

  return layout({
    headerGradient: 'linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)',
    headerIcon: '🤝',
    headerTitle: 'KidSchedule',
    headerSubtitle: 'Mediation session',
    body: `
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">Hello, ${p.recipientName}</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
        <strong style="color:#0f172a;">${p.initiatorName}</strong> started a mediation session
        on the topic: <strong style="color:#0f172a;">${p.topic}</strong>.
      </p>
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0;color:#5b21b6;font-size:14px;line-height:1.6;">
          KidSchedule's AI-assisted mediation helps resolve differences constructively
          and with your children's wellbeing at the center.
        </p>
      </div>
      ${btn('View mediation session →', mediationUrl, '#7c3aed')}
    `,
  });
}

function buildCoParentEmail(p: {
  inviterName: string;
  familyName: string;
  childrenText: string;
  joinUrl: string;
}): string {
  return layout({
    headerGradient: 'linear-gradient(135deg,#2dd4bf 0%,#14b8a6 100%)',
    headerIcon: '📅',
    headerTitle: 'KidSchedule',
    headerSubtitle: 'Co-parent invitation',
    body: `
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">You have an invitation</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
        <strong style="color:#0f172a;">${p.inviterName}</strong> invited you to co-manage custody
        of <strong style="color:#0f172a;">${p.childrenText}</strong> in the
        <strong style="color:#0f172a;">${p.familyName}</strong> family.
      </p>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.7;">
        With KidSchedule you can coordinate the custody calendar, manage shared expenses,
        communicate securely, and much more — all in one place.
      </p>
      ${btn('Join KidSchedule →', p.joinUrl, '#14b8a6')}
      <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;text-align:center;">The link expires in 7 days.</p>
    `,
  });
}

function buildCaregiverEmail(p: {
  caregiverName: string;
  inviterName: string;
  familyName: string;
  childrenText: string;
  permList: string[];
  accessUrl: string;
}): string {
  const permItems =
    p.permList.length > 0
      ? p.permList.map((perm) => `<li style="margin:4px 0;color:#475569;font-size:14px;">✓ ${perm}</li>`).join('')
      : '<li style="margin:4px 0;color:#475569;font-size:14px;">Basic calendar access</li>';

  return layout({
    headerGradient: 'linear-gradient(135deg,#a855f7 0%,#9333ea 100%)',
    headerIcon: '🛡️',
    headerTitle: 'KidSchedule',
    headerSubtitle: 'Caregiver Access',
    body: `
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">Hello, ${p.caregiverName}</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
        <strong style="color:#0f172a;">${p.inviterName}</strong> granted you caregiver access
        for <strong style="color:#0f172a;">${p.childrenText}</strong> in the
        <strong style="color:#0f172a;">${p.familyName}</strong> family.
      </p>
      <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
        <p style="margin:0 0 10px;color:#6b21a8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;">Your access includes</p>
        <ul style="margin:0;padding:0 0 0 4px;list-style:none;">${permItems}</ul>
      </div>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.7;">
        Your access is <strong>read-only</strong>. You will not be able to make changes to the calendar
        or access information outside your permissions.
      </p>
      ${btn('View my access →', p.accessUrl, '#9333ea')}
    `,
  });
}

function buildJoinRequestEmail(p: {
  adminName: string;
  orgName: string;
  requesterName: string;
  dashboardUrl: string;
}): string {
  return layout({
    headerGradient: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
    headerIcon: '🏫',
    headerTitle: 'KidSchedule',
    headerSubtitle: 'Join request',
    body: `
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">Hello, ${p.adminName}</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
        <strong style="color:#0f172a;">${p.requesterName}</strong> has requested to join
        <strong style="color:#0f172a;">${p.orgName}</strong> and is waiting for your approval.
      </p>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.7;">
        Go to the admin panel to approve or reject the request.
      </p>
      ${btn('View pending requests →', p.dashboardUrl, '#d97706')}
    `,
  });
}

function buildMemberApprovedEmail(p: {
  memberName: string;
  orgName: string;
  orgUrl: string;
}): string {
  return layout({
    headerGradient: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
    headerIcon: '✅',
    headerTitle: 'KidSchedule',
    headerSubtitle: 'Request approved',
    body: `
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">Hello, ${p.memberName}</h2>
      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
        Your request to join <strong style="color:#0f172a;">${p.orgName}</strong> has been
        <strong style="color:#16a34a;">approved</strong>. You now have full access to the group.
      </p>
      ${btn('View my group →', p.orgUrl, '#16a34a')}
    `,
  });
}

function buildOrgRosterInviteEmail(p: {
  parentName: string;
  childName: string;
  orgName: string;
  portalUrl: string;
}): string {
  return layout({
    headerGradient: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    headerIcon: '📅',
    headerTitle: p.orgName,
    headerSubtitle: `${p.childName}'s calendar`,
    body: `
      <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
        Hello <strong style="color:#0f172a;">${p.parentName}</strong>,
      </p>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
        You have been given read-only access to the <strong style="color:#0f172a;">${p.orgName}</strong>
        calendar so you can view events related to <strong style="color:#0f172a;">${p.childName}</strong>.
      </p>
      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
        No account needed — simply click the button below to view the calendar.
      </p>
      ${btn('View calendar →', p.portalUrl, '#7c3aed')}
      <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
        This link is personal. Do not share it with third parties.
      </p>
    `,
  });
}
