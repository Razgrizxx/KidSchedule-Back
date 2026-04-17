import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Throttle } from '@nestjs/throttler';
import { TestMailService } from './test-mail.service';

class SendTestEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body: string;
}

// In production the VPS mounts uploads at /home/christian/uploads,
// locally we use ./uploads relative to the project root (CWD).
function getUploadRoot(): string {
  return process.env.NODE_ENV === 'production'
    ? '/home/christian/uploads'
    : join(process.cwd(), 'uploads');
}

const diskStorageConfig = diskStorage({
  destination(_req, file, cb) {
    const isImage = file.mimetype.startsWith('image/');
    const sub = isImage ? 'images' : 'docs';
    const dest = join(getUploadRoot(), sub);
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('test')
export class TestController {
  constructor(private readonly mail: TestMailService) {}

  // ── SMTP verify ────────────────────────────────────────────────────────────
  @Get('email/verify')
  verifySmtp() {
    return this.mail.verify();
  }

  // ── Send test email ────────────────────────────────────────────────────────
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('email')
  async sendEmail(@Body() dto: SendTestEmailDto) {
    const result = await this.mail.sendTest(dto.to, dto.subject, dto.body);
    return { ok: true, ...result };
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorageConfig,
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
      fileFilter(_req, file, cb) {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'application/pdf',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`File type not allowed: ${file.mimetype}`), false);
        }
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file received');

    const isImage = file.mimetype.startsWith('image/');
    const sub = isImage ? 'images' : 'docs';
    const url = `/uploads/${sub}/${file.filename}`;

    return {
      ok: true,
      url,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      savedTo: file.path,
    };
  }
}
