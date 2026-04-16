import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class TestMailService {
  private readonly logger = new Logger(TestMailService.name);
  private transporter: Transporter;
  private readonly from: string;

  constructor(private config: ConfigService) {
    const host = config.getOrThrow<string>('SMTP_HOST');
    const port = Number(config.getOrThrow<string>('SMTP_PORT'));
    const user = config.getOrThrow<string>('SMTP_USER');
    const pass = config.getOrThrow<string>('SMTP_PASS');

    // Port 465 → implicit TLS (secure: true)
    // Port 587 → STARTTLS (secure: false)
    const secure = port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    this.from = `KidSchedule Test <${user}>`;
  }

  async verify(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async sendTest(to: string, subject: string, body: string): Promise<{ messageId: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#f1f5f9;margin:0;padding:40px 16px;">
        <table width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#2dd4bf,#0891b2);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">KidSchedule</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,.8);font-size:12px;">SMTP Test Email</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.7;">${body}</p>
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                Sent via SMTP sandbox — ${new Date().toISOString()}
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>`;

    this.logger.log(`[SMTP] Sending "${subject}" → ${to}`);

    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
    });

    this.logger.log(`[SMTP] Sent — messageId: ${info.messageId}`);
    return { messageId: info.messageId as string };
  }
}
