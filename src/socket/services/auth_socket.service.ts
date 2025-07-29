import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NextFunction } from 'express';
import { Redis } from 'ioredis';
import { Socket } from 'socket.io';
import { CustomException } from 'src/common/constant/custom-error';
import { JWTService } from 'src/common/services/jwt.service';
import { RedisService } from 'src/common/services/redis.service';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';

@Injectable()
export class AuthSocketService {
  constructor(
    private readonly jwtServices: JWTService,
    @InjectModel(UserRefreshToken)
    private userRefreshTokenRepository: typeof UserRefreshToken,
    private readonly redisService: RedisService,
  ) {}
  public readonly authentication = async (
    socket: Socket,
    next: NextFunction,
  ) => {
    try {
      let rawToken = socket.handshake.auth.token;
      if (!rawToken) {
        rawToken = socket.handshake.headers.token;
        if (!rawToken) {
          socket.disconnect(true);
          throw new CustomException(
            'Token not exists, please set token and  try again ',
          );
        }
      }
      if (rawToken.startsWith('Bearer '))
        rawToken = rawToken.replace('Bearer ', '');
      let decoded: any;
      try {
        decoded = await this.jwtServices.verifyToken(
          rawToken,
          process.env.TOKEN_SECRET_KEY as string,
        );
      } catch (error) {
        throw new CustomException('  🤨 bad token  ');
      }

      const validToken: string = await this.redisService.getFromRedisCache(
        `${decoded.id}`,
      );
      const isLogOut: any = await this.userRefreshTokenRepository.findOne({
        raw: true,
        where: { user_id: decoded.id },
      });

      if (!decoded) throw new CustomException('  🤨 bad token  ');

      if (decoded.is_active === false)
        throw new CustomException(
          'You must complete email verification to complete the process',
        );

      if (!isLogOut) throw new CustomException('  🤨You have logged out');
      if (rawToken != validToken)
        throw new CustomException(
          'your token is old or forbidden please login agin ',
        );

      socket.handshake.headers.user = decoded;
      next();
    } catch (error) {
      console.log(error);
      next(new CustomException(error.message));
    }
  };
}
