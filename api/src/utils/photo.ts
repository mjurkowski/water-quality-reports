import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { config } from '@/config/app';

export async function savePhoto(base64Data: string, mimeType: string): Promise<{
  url: string;
  filename: string;
  size: number;
}> {
  // Extract base64 data
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid base64 image format');
  }

  const [, extension, data] = matches;
  const buffer = Buffer.from(data, 'base64');

  // Validate file size
  if (buffer.length > config.maxFileSize) {
    throw new Error(`File too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB.`);
  }

  // Validate extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (!allowedExtensions.includes(extension.toLowerCase())) {
    throw new Error('Invalid file type. Allowed: JPG, PNG, WebP, GIF');
  }

  // Validate MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error('Invalid MIME type');
  }

  // Generate unique filename
  const hash = createHash('sha256').update(buffer).digest('hex').substring(0, 16);
  const filename = `${Date.now()}-${hash}.${extension}`;

  // Ensure upload directory exists
  await mkdir(config.uploadDir, { recursive: true });

  // Save file
  const filepath = join(config.uploadDir, filename);
  await writeFile(filepath, buffer);

  // Return metadata
  return {
    url: `/uploads/${filename}`,
    filename,
    size: buffer.length,
  };
}
