import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Logger,
} from '@nestjs/common';
import { JWTService } from '../services/jwt.service';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { InjectModel } from '@nestjs/sequelize';
import { RedisService } from '../services/redis.service';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { Request } from 'express';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
    private readonly logger = new Logger(OptionalAuthGuard.name);

    constructor(
        private readonly jwtServices: JWTService,
        @InjectModel(UserRefreshToken)
        private userRefreshTokenRepository: typeof UserRefreshToken,
        @InjectModel(UserDevice)
        private userDeviceRepository: typeof UserDevice,
        private readonly cacheManager: RedisService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        try {
            // Check for Authorization header
            let rawToken: any = request.headers.authorization || request.headers.Authorization;

            // If no token, allow access as guest
            if (!rawToken) {
                this.logger.log('No authorization token found, proceeding as guest');
                request.user = null; // Set user to null for guest access
                return true;
            }

            // Process JWT token if present
            if (rawToken.startsWith('Bearer ')) {
                rawToken = rawToken.replace('Bearer ', '');
            }

            const decoded: any = await this.jwtServices.verifyToken(
                rawToken,
                process.env.TOKEN_SECRET_KEY as string,
            );

            if (!decoded) {
                this.logger.warn('Invalid token provided, proceeding as guest');
                request.user = null;
                return true;
            }

            // Verify token is not logged out
            const isLogOut: any = await this.userRefreshTokenRepository.findOne({
                raw: true,
                nest: true,
                include: [
                    {
                        model: this.userDeviceRepository,
                        required: true,
                        attributes: ['serial'],
                    },
                ],
                where: {
                    user_id: decoded.id,
                    device_id: decoded.device_id,
                },
            });

            if (!isLogOut) {
                this.logger.warn('User has logged out, proceeding as guest');
                request.user = null;
                return true;
            }

            // Check JTI in Redis
            const storedJti: string | null = await this.cacheManager.getFromRedisCache(`${isLogOut.id}`);

            if (decoded.jti !== storedJti) {
                this.logger.warn('Token JTI mismatch, proceeding as guest');
                request.user = null;
                return true;
            }

            // Check device serial if available
            if (request.device_serial && request.device_serial !== isLogOut.device.serial) {
                this.logger.warn('Device serial mismatch, proceeding as guest');
                request.user = null;
                return true;
            }

            // Set authenticated user
            request.user = {
                id: decoded.id,
                role_id: decoded.role_id,
                language_id: decoded.language_id,
                device_id: decoded.device_id,
                email: decoded.email,
                phone_number: decoded.phone_number,
            };

            this.logger.log(`User authenticated: ${decoded.id}`);
            return true;

        } catch (error) {
            this.logger.warn(`Authentication error: ${error.message}, proceeding as guest`);
            request.user = null;
            return true;
        }
    }
} 