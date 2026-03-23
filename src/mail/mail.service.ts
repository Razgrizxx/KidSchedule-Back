import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailer: MailerService) {}

  async sendCoParentInvitation(opts: {
    toEmail: string;
    inviterName: string;
    familyName: string;
    childrenNames: string[];
    token: string;
    appUrl: string;
  }): Promise<void> {
    const joinUrl = `${opts.appUrl}/join?token=${opts.token}`;
    const childrenText =
      opts.childrenNames.length > 0
        ? opts.childrenNames.join(', ')
        : 'tu/s hijo/s';
    try {
      await this.mailer.sendMail({
        to: opts.toEmail,
        subject: `${opts.inviterName} te invitó a co-gestionar la custodia en KidSchedule`,
        html: buildCoParentEmail({
          inviterName: opts.inviterName,
          familyName: opts.familyName,
          childrenText,
          joinUrl,
        }),
      });
    } catch (err) {
      this.logger.error('Failed to send co-parent invitation email', err);
    }
  }

  async sendJoinRequest(opts: {
    adminEmail: string;
    adminName: string;
    orgName: string;
    requesterName: string;
    appUrl: string;
  }): Promise<void> {
    const dashboardUrl = `${opts.appUrl}/dashboard/organizations`;
    try {
      await this.mailer.sendMail({
        to: opts.adminEmail,
        subject: `${opts.requesterName} quiere unirse a ${opts.orgName} en KidSchedule`,
        html: buildJoinRequestEmail({ ...opts, dashboardUrl }),
      });
    } catch (err) {
      this.logger.error('Failed to send join request email', err);
    }
  }

  async sendMemberApproved(opts: {
    toEmail: string;
    memberName: string;
    orgName: string;
    appUrl: string;
  }): Promise<void> {
    const orgUrl = `${opts.appUrl}/dashboard/organizations`;
    try {
      await this.mailer.sendMail({
        to: opts.toEmail,
        subject: `Tu solicitud para unirte a ${opts.orgName} fue aprobada`,
        html: buildMemberApprovedEmail({ ...opts, orgUrl }),
      });
    } catch (err) {
      this.logger.error('Failed to send member approved email', err);
    }
  }

  async sendCaregiverInvitation(opts: {
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
  }): Promise<void> {
    const accessUrl = `${opts.appUrl}/caregiver-access?token=${opts.inviteToken}`;
    const childrenText =
      opts.childrenNames.length > 0 ? opts.childrenNames.join(', ') : 'un niño';
    const permList = [
      opts.permissions.canViewCalendar && 'Calendario de custodia',
      opts.permissions.canViewHealthInfo && 'Información del niño',
      opts.permissions.canViewEmergencyContacts && 'Contactos de emergencia',
      opts.permissions.canViewAllergies && 'Alergias y notas médicas',
    ].filter(Boolean) as string[];

    try {
      await this.mailer.sendMail({
        to: opts.toEmail,
        subject: `${opts.inviterName} te otorgó acceso como cuidador en KidSchedule`,
        html: buildCaregiverEmail({
          caregiverName: opts.caregiverName,
          inviterName: opts.inviterName,
          familyName: opts.familyName,
          childrenText,
          permList,
          accessUrl,
        }),
      });
    } catch (err) {
      this.logger.error('Failed to send caregiver invitation email', err);
    }
  }
}

// ── Email templates ───────────────────────────────────────────────────────────

function buildCoParentEmail(p: {
  inviterName: string;
  familyName: string;
  childrenText: string;
  joinUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#2dd4bf,#14b8a6);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,.2);border-radius:14px;line-height:56px;margin-bottom:12px;font-size:28px;">📅</div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">KidSchedule</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;">La agenda familiar que realmente funciona</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Tienes una invitación</h2>
            <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
              <strong style="color:#0f172a;">${p.inviterName}</strong> te ha invitado a co-gestionar
              la custodia de <strong style="color:#0f172a;">${p.childrenText}</strong> en la familia
              <strong style="color:#0f172a;">${p.familyName}</strong>.
            </p>
            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;">
              Con KidSchedule podrás coordinar el calendario de custodia, gestionar gastos compartidos,
              comunicarte de forma segura y mucho más — todo en un mismo lugar.
            </p>
            <div style="text-align:center;margin:0 0 28px;">
              <a href="${p.joinUrl}" style="display:inline-block;background:#14b8a6;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;">
                Unirse a KidSchedule →
              </a>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.5;">
              Si no esperabas esta invitación, puedes ignorar este email.<br>
              El enlace expira en 7 días.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;color:#cbd5e1;font-size:11px;">© ${new Date().getFullYear()} KidSchedule</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
      ? p.permList
          .map(
            (perm) =>
              `<li style="margin:4px 0;color:#475569;font-size:14px;">✓ ${perm}</li>`,
          )
          .join('')
      : '<li style="margin:4px 0;color:#475569;font-size:14px;">Acceso básico al calendario</li>';

  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#a855f7,#9333ea);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,.2);border-radius:14px;line-height:56px;margin-bottom:12px;font-size:28px;">🛡️</div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">KidSchedule</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;">Acceso como Cuidador</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Hola, ${p.caregiverName}</h2>
            <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
              <strong style="color:#0f172a;">${p.inviterName}</strong> te ha otorgado acceso como
              cuidador para <strong style="color:#0f172a;">${p.childrenText}</strong> en la familia
              <strong style="color:#0f172a;">${p.familyName}</strong>.
            </p>
            <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0 0 8px;color:#6b21a8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Tu acceso incluye</p>
              <ul style="margin:0;padding:0 0 0 4px;list-style:none;">${permItems}</ul>
            </div>
            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;">
              Tu acceso es <strong>de solo lectura</strong>. No podrás realizar cambios en el calendario
              ni acceder a información no incluida en tu lista de permisos.
            </p>
            <div style="text-align:center;margin:0 0 28px;">
              <a href="${p.accessUrl}" style="display:inline-block;background:#9333ea;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;">
                Ver mi acceso →
              </a>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.5;">
              Si no conoces a ${p.inviterName}, puedes ignorar este email con seguridad.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;color:#cbd5e1;font-size:11px;">© ${new Date().getFullYear()} KidSchedule</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildJoinRequestEmail(p: {
  adminName: string;
  orgName: string;
  requesterName: string;
  dashboardUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,.2);border-radius:14px;line-height:56px;margin-bottom:12px;font-size:28px;">🏫</div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">KidSchedule</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;">Solicitud de ingreso</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Hola, ${p.adminName}</h2>
            <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
              <strong style="color:#0f172a;">${p.requesterName}</strong> ha solicitado unirse a
              <strong style="color:#0f172a;">${p.orgName}</strong> y está esperando tu aprobación.
            </p>
            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;">
              Ingresa al panel de administración para aprobar o rechazar la solicitud.
            </p>
            <div style="text-align:center;margin:0 0 28px;">
              <a href="${p.dashboardUrl}" style="display:inline-block;background:#d97706;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;">
                Ver solicitudes pendientes →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;color:#cbd5e1;font-size:11px;">© ${new Date().getFullYear()} KidSchedule</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildMemberApprovedEmail(p: {
  memberName: string;
  orgName: string;
  orgUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,.2);border-radius:14px;line-height:56px;margin-bottom:12px;font-size:28px;">✅</div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">KidSchedule</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;">Solicitud aprobada</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Hola, ${p.memberName}</h2>
            <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
              Tu solicitud para unirte a <strong style="color:#0f172a;">${p.orgName}</strong> fue
              <strong style="color:#16a34a;">aprobada</strong>. Ya tienes acceso completo al grupo.
            </p>
            <div style="text-align:center;margin:0 0 28px;">
              <a href="${p.orgUrl}" style="display:inline-block;background:#16a34a;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;">
                Ver mi grupo →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;color:#cbd5e1;font-size:11px;">© ${new Date().getFullYear()} KidSchedule</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
