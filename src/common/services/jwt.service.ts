import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { CustomException } from 'src/common/constant/custom-error';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class JWTService {
  constructor(private jwtService: JwtService) {}
  public verifyToken = async (token: string, SECRET_KEY: string) => {
    try {
      const secretKey = Buffer.from(process.env.SECRET_KEY || '', 'hex');
      const decoded = await this.jwtService.verify(token, {
        secret: SECRET_KEY,
      });
      if (!decoded || !decoded.hasOwnProperty('encrypted')) {
        throw new Error('Invalid token');
      }
      // Decrypt the payload
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        secretKey,
        Buffer.alloc(16),
      );
      let decrypted = decipher.update(decoded.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const timeLeftInSeconds = decoded.exp - currentTimeInSeconds;

      // Parse the decrypted payload
      return { ...JSON.parse(decrypted), exp: timeLeftInSeconds };
    } catch (error) {
      throw new CustomException(error.message);
    }
  };
  public generateToken = (payload: any, SECRET_KEY: string, expiresIn: any) => {
    const secretKey = Buffer.from(process.env.SECRET_KEY || '', 'hex');
    const jti = uuidv4();
    const payloadStr = JSON.stringify({ ...payload, jti });
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      secretKey,
      Buffer.alloc(16),
    );
    let encrypted = cipher.update(payloadStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const token = this.jwtService.sign(
      {
        encrypted,
      },
      {
        secret: SECRET_KEY,
        expiresIn,
      },
    );
    return { token, jti };
  };
}
