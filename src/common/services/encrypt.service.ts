// src/services/encryption.service.ts

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { compare, hash, genSalt } from 'bcrypt';

@Injectable()
export class EncryptionService {
  async encrypt(plaintext: string): Promise<Object> {
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const iv = Buffer.alloc(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const salt = await genSalt(10);
    const hashedData = await hash(plaintext + process.env.HASH_SECRET, salt);

    return { hashedData, encrypted };
  }
  async decrypt(cipherText: string, hashedData: string): Promise<any> {
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const ivBuffer = Buffer.alloc(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    let hashCheck = await compare(
      decrypted + process.env.HASH_SECRET,
      hashedData,
    );
    if (!hashCheck) return false;

    return decrypted;
  }
  static encryptToken(plaintext: string): string {
    const secretKey = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
    const compressed = zlib.deflateSync(plaintext);

    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      secretKey,
      Buffer.alloc(16),
    );
    let encrypted = cipher.update(compressed);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('base64');
  }
  decryptToken(encryptedText: string): string {
    const secretKey = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
    const encrypted = Buffer.from(encryptedText, 'base64');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      secretKey,
      Buffer.alloc(16),
    );

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return zlib.inflateSync(decrypted).toString('utf8');
  }
}
