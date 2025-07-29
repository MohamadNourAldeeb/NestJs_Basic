import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class UuidService {
  generateUuid(): string {
    const timestamp = Date.now();

    const randomBytes = crypto.randomUUID();

    const timestampHex = timestamp.toString(16).padStart(12, '0');

    const combinedString = timestampHex + randomBytes.toString();

    return combinedString.substring(combinedString.length - 10);
  }

  static generateUuidFun(): string {
    const timestamp = Date.now();

    const randomBytes = crypto.randomUUID();

    const timestampHex = timestamp.toString(16).padStart(12, '0');

    const combinedString = timestampHex + randomBytes.toString();

    return combinedString.substring(combinedString.length - 10);
  }
}
