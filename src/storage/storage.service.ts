import { Injectable } from '@nestjs/common';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

function uploadsRoot(): string {
  return process.env.NODE_ENV === 'production'
    ? '/home/christian/uploads'
    : join(process.cwd(), 'uploads');
}

@Injectable()
export class LocalStorageService {
  async upload(
    file: Express.Multer.File,
    folder: string,
    _resourceType?: string,
  ): Promise<{ secure_url: string; public_id: string }> {
    // Strip legacy 'kidschedule/' prefix used in Cloudinary folder paths
    const sub = folder.replace(/^kidschedule\//, '');
    const dir = join(uploadsRoot(), sub);

    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const filename = `${unique}${extname(file.originalname)}`;

    await writeFile(join(dir, filename), file.buffer);

    const public_id = `${sub}/${filename}`;
    const secure_url = `/uploads/${public_id}`;

    return { secure_url, public_id };
  }

  async delete(publicId: string): Promise<void> {
    // publicId is the path relative to uploads root, e.g. "avatars/123.jpg"
    await unlink(join(uploadsRoot(), publicId)).catch(() => {});
  }
}
