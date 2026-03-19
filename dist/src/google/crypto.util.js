"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = require("crypto");
const ALGORITHM = 'aes-256-cbc';
const SALT = 'kidschedule-google-tokens';
function deriveKey(secret) {
    return (0, crypto_1.scryptSync)(secret, SALT, 32);
}
function encrypt(text, secret) {
    const key = deriveKey(secret);
    const iv = (0, crypto_1.randomBytes)(16);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}
function decrypt(encryptedText, secret) {
    const [ivHex, encHex] = encryptedText.split(':');
    const key = deriveKey(secret);
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encHex, 'hex');
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
//# sourceMappingURL=crypto.util.js.map