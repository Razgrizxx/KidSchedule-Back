import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SALT = 'kidschedule-google-tokens';

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, SALT, 32);
}

/**
 * Encrypts a plaintext string with AES-256-CBC.
 * Returns "iv_hex:ciphertext_hex".
 */
export function encrypt(text: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string produced by encrypt().
 */
export function decrypt(encryptedText: string, secret: string): string {
  const [ivHex, encHex] = encryptedText.split(':');
  const key = deriveKey(secret);
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
