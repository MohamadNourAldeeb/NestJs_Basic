import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { EncryptionService } from 'src/common/services/encrypt.service';
import { Request, Response } from 'express';
import { RedisService } from 'src/common/services/redis.service';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { Role } from 'src/role/entities/role.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { RolePermission } from 'src/role/entities/roles_permissions.entity';
import { UserPermission } from 'src/user/entities/user_permission.entity';
import { User } from 'src/user/entities/user.entity';
import { JWTService } from 'src/common/services/jwt.service';
import { MailService } from 'src/mailer/mailer.service';
import { CustomException } from 'src/common/constant/custom-error';
import { sendHttpResponse } from 'src/common/services/request.service';
import {
  enumStateOfEmail,
  enumTypeOfLogs,
  enumUserPermissionsType,
  enumVerificationType,
} from 'src/common/enums/enums';
import { UuidService } from 'src/common/services/uuid.service';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { Version } from 'src/versions/entities/version.entity';
import {
  downloadAndSaveProfilePicture,
  generatePassword,
  timeToMilliseconds,
  timeToSeconds,
} from 'src/common/utilis/helper';
import * as crypto from 'crypto';
import { VerificationDto } from './dto/verification.dto';
import { sendCodeDto } from './dto/send_code.dto';
import { signInDto, SignInWithGoogleDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { changePassDto } from './dto/change-password.dto';
import { UserLog } from 'src/user/entities/user_log.entity';
import { Op } from 'sequelize';
import { FirebaseService } from 'src/firebase/firebase.service';
import axios from 'axios';
import { googleSignInConfig } from 'src/config/google_sign_in.config';
import { Language } from 'src/languages/entities/language.entity';
import { IdDto } from 'src/common/global/dto/global.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    @InjectModel(UserPermission)
    private UserPermissionRepository: typeof UserPermission,
    @InjectModel(UserLog)
    private UserLogRepository: typeof UserLog,
    @InjectModel(RolePermission)
    private RolePermissionRepository: typeof RolePermission,
    @InjectModel(Permission)
    private PermissionRepository: typeof Permission,
    @InjectModel(Role)
    private RoleRepository: typeof Role,
    @InjectModel(UserRefreshToken)
    private userRefreshTokenRepository: typeof UserRefreshToken,
    @InjectModel(UserDevice)
    private userDeviceRepository: typeof UserDevice,
    @InjectModel(Version)
    private versionRepository: typeof Version,
    @InjectModel(Language)
    private LanguageRepository: typeof Language,
    private readonly jwtServices: JWTService,
    private readonly mailerService: MailService,
    @InjectConnection() private sequelizeConnection: Sequelize,
    private readonly redisService: RedisService,
    private readonly encryptionService: EncryptionService,
    private readonly uuidService: UuidService,
  ) {}
  // _______________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async SignInWithGoogle(
    req: Request,
    res: Response,
    body: SignInWithGoogleDto,
  ): Promise<any> {
    const {
      device_name,
      app_type,
      fcm_token,
      app_version,
      language_code,
      google_token,
    }: any = body;

    let email: string | null = null;
    let name: string | null = null;
    let picture: string | null = null;
    let google_id: string | null = null;
    // check the token
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://oauth2.googleapis.com/tokeninfo?id_token=${google_token}`,
    };

    const response: any = await axios.request(config).catch((error) => {
      throw new CustomException(
        `something went error with google api connection , ${error}`,
      );
    });
    const payload = response.data;
    // check the issure
    if (
      !['accounts.google.com', 'https://accounts.google.com'].includes(
        payload.iss,
      )
    ) {
      throw new CustomException('Invalid token issuer');
    }
    const expectedClientId = googleSignInConfig.client_id;

    // check the setting
    if (!expectedClientId) {
      throw new CustomException('Google client ID is not configured on server');
    }
    if (payload.aud !== expectedClientId) {
      throw new CustomException('Token audience mismatch');
    }

    // check if the email verified from google
    if (!payload.email_verified) {
      throw new CustomException('Email is not verified by Google');
    }

    if (!payload.email) {
      throw new CustomException('Email not found in Google token');
    }
    google_id = payload.sub;
    email = payload.email;
    name = payload.name;
    picture = payload.picture;

    let token: any = null;
    let refreshToken: any = null;
    let userDevice: any = null;

    let user: User = await this.userRepository.findOne({
      raw: true,
      where: { email },
    });

    let rolePermissions: RolePermission[] =
      await this.RolePermissionRepository.findAll({
        raw: true,
        attributes: ['permission_id'],
        where: { role_id: user.role_id },
      });
    let allPermissions: number[] = rolePermissions.map(
      (item: any) => item.permission_id,
    );

    let dbLanguage: Language = await this.LanguageRepository.findOne({
      raw: true,
      attributes: ['id'],
      where: { lang_code: language_code },
    });
    if (!dbLanguage)
      throw new CustomException('the language code is incorrect');

    await this.sequelizeConnection.transaction(async (transaction: any) => {
      if (!user) {
        user = await this.userRepository.create({
          _id: this.uuidService.generateUuid(),
          user_name: generatePassword(name),
          email,
          email_state: enumStateOfEmail.VERIFIED,
          first_name: name,
          last_name: null,
          phone_number: null,
          google_id,
          role_id: 2,
          language_id: dbLanguage.id,
        });
      } else if (user && user.email_state == enumStateOfEmail.UNVERIFIED) {
        await this.userRepository.update(
          { email_state: enumStateOfEmail.VERIFIED },
          {
            where: { id: user.id },
            transaction,
          },
        );
      }

      let version: Version = await this.versionRepository.findOne({
        raw: true,
        attributes: ['id'],
        where: { app_version, app_type },
      });
      if (!version)
        throw new CustomException('the version with this os type is incorrect');

      let userDeviceCreateBody: any = {
        _id: this.uuidService.generateUuid(),
        serial: req.device_serial,
        name: device_name,
        os_type: app_type,
        is_block: false,
        user_id: user.id,
      };

      let deviceCheck: UserDevice = await this.userDeviceRepository.findOne({
        attributes: ['id'],
        where: {
          os_type: app_type,
          serial: req.device_serial,
          user_id: user.id,
        },
      });

      if (deviceCheck) {
        userDevice = deviceCheck;
      } else {
        userDevice = await this.userDeviceRepository.create(
          userDeviceCreateBody,
          { transaction },
        );
      }

      token = this.jwtServices.generateToken(
        {
          id: user.id,
          lang_id: dbLanguage.id,
          role_id: user.role_id,
          email: user.email ? user.email : null,
          phone_number: user.phone_number ? user.phone_number : null,
          device_id: userDevice.id,
        },
        process.env.TOKEN_SECRET_KEY,
        process.env.TOKEN_EXPIRES_IN,
      );

      refreshToken = this.jwtServices.generateToken(
        {
          id: user.id,
          lang_id: dbLanguage.id,
          role_id: user.role_id,
          email: user.email ? user.email : null,
          phone_number: user.phone_number ? user.phone_number : null,
          device_id: userDevice.id,
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        process.env.REFRESH_TOKEN_EXPIRES_IN,
      );
      if (
        await this.userRefreshTokenRepository.findOne({
          raw: true,
          attributes: ['id'],
          where: { user_id: user.id, device_id: userDevice.id },
        })
      ) {
        await this.userRefreshTokenRepository.destroy({
          where: { user_id: user.id, device_id: userDevice.id },
          transaction,
        });
      }
      let createdRefreshToken: UserRefreshToken =
        await this.userRefreshTokenRepository.create(
          {
            _id: this.uuidService.generateUuid(),
            token: refreshToken.token,
            fcm_token: fcm_token,
            user_id: user.id,
            device_id: userDevice.id,
            version_id: version.id,
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          { transaction },
        );
      await this.UserLogRepository.create(
        {
          _id: this.uuidService.generateUuid(),
          type: enumTypeOfLogs.LOGIN,
          user_id: user.id,
          device_id: userDevice.id,
        },
        { transaction },
      );
      await this.redisService.addToRedisCache(
        `${createdRefreshToken.id}`,
        `${token.jti}`,
        timeToMilliseconds(process.env.TOKEN_EXPIRES_IN),
      );
    });
    let checkAnotherDevice: UserRefreshToken[] =
      await this.userRefreshTokenRepository.findAll({
        raw: true,
        where: { user_id: user.id },
      });
    if (checkAnotherDevice.length > 1) {
      let fcmTokens: any = checkAnotherDevice.map((item: any) => {
        return item.fcm_token;
      });
      fcmTokens = Array.from(new Set(fcmTokens));
      FirebaseService.sendMultiNotification(
        fcmTokens,
        `Your account was logged in from device: ${body.device_name}`,
        `Is this you? If not, check your login and logout records`,
      );
    }
    downloadAndSaveProfilePicture(picture, email);
    sendHttpResponse(res, HttpStatus.OK, {
      message: `Hello , And welcome in  Basic Nestjs App 🙋‍♂️`,
      token: token.token,
      refresh_token: refreshToken.token,
      user_id: user._id,
      user_name: user.user_name,
      user_first_name: user.first_name,
      user_last_name: user.last_name,
      phone_number: user.phone_number,
      email: user.email,
      email_state: user.email_state,
      role_id: user.role._id,
      role_name: user.role.name,
      user_permissions: allPermissions,
    });
  }
  // _______________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async signIn(req: Request, res: Response, body: signInDto): Promise<any> {
    const {
      user_name_or_email,
      password,
      device_name,
      app_type,
      fcm_token,
      app_version,
      language_code,
    } = body;
    let user: User = await this.userRepository.findOne({
      raw: true,
      nest: true,
      include: [
        {
          model: this.RoleRepository,
          required: true,
          attributes: ['id', '_id', 'name'],
        },
      ],
      where: {
        [Op.or]: [
          { user_name: user_name_or_email },
          { email: user_name_or_email },
        ],
      },
    });
    if (!user)
      throw new CustomException(
        'The entered user name or email is incorrect ❌',
      );

    let trying_count = +(await this.redisService.getFromRedisCache(
      `${user._id}_trying`,
    ));
    let timeToLive = await this.redisService.getTimeToLive(
      `${user._id}_trying`,
    );

    if (trying_count && trying_count > 4) {
      const minutes = Math.floor(timeToLive / 60);
      const seconds = timeToLive % 60;
      let errorMessage = `Try again after 5 minutes`;
      if (minutes > 0 && seconds > 0) {
        errorMessage = ` Try again after ${minutes} minute(s) and ${seconds} second(s).`;
      } else if (minutes > 0) {
        errorMessage = ` Try again after ${minutes} minute(s).`;
      } else {
        errorMessage = ` Try again after ${seconds} second(s).`;
      }
      throw new CustomException(errorMessage);
    }

    let check_pass = await bcrypt.compare(password, user.password);
    if (!check_pass) {
      trying_count = trying_count ? trying_count : 0;
      await this.redisService.addToRedisCache(
        `${user._id}_trying`,
        `${trying_count + 1}`,
        5 * 60,
      );
      throw new CustomException('The entered password is incorrect ❌');
    }

    let version: Version = await this.versionRepository.findOne({
      raw: true,
      attributes: ['id'],
      where: { app_version, app_type },
    });
    if (!version)
      throw new CustomException(
        'the version with this os type is incorrect ❌',
      );
    let dbLanguage: Language = await this.LanguageRepository.findOne({
      raw: true,
      attributes: ['id'],
      where: { lang_code: language_code },
    });
    if (!dbLanguage)
      throw new CustomException('the language code is incorrect');

    // get default role for user
    let rolePermissions: RolePermission[] =
      await this.RolePermissionRepository.findAll({
        raw: true,
        attributes: ['permission_id'],
        where: { role_id: user.role_id },
      });
    let rolePermissionsIds: number[] = rolePermissions.map(
      (item: any) => item.permission_id,
    );

    // get custom permissions for user
    let userPermissions: UserPermission[] =
      await this.UserPermissionRepository.findAll({
        raw: true,
        attributes: ['permission_id', 'status'],
        where: { user_id: user.id },
      });
    let userIncludePermissions: number[] = [];
    let userExcludePermissions: number[] = [];
    let allPermissions: number[] = rolePermissionsIds;
    userPermissions.map((item: any) => {
      if (item.status == enumUserPermissionsType.INCLUDE)
        userIncludePermissions.push(item.permission_id);
      else userExcludePermissions.push(item.permission_id);
    });
    if (userExcludePermissions.length != 0)
      allPermissions = rolePermissionsIds.filter(
        (item: any) => !userExcludePermissions.includes(item),
      );
    allPermissions = allPermissions.concat(userIncludePermissions);

    let token: any = null;
    let refreshToken: any = null;
    let userDevice: any = null;
    await this.sequelizeConnection.transaction(async (transaction: any) => {
      let deviceCheck: any = await this.userDeviceRepository.findOne({
        attributes: ['id'],
        where: {
          os_type: app_type,
          serial: req.device_serial,
          user_id: user.id,
        },
      });
      if (deviceCheck) {
        userDevice = deviceCheck;
      } else {
        userDevice = await this.userDeviceRepository.create(
          {
            _id: this.uuidService.generateUuid(),
            serial: req.device_serial,
            name: device_name,
            os_type: app_type,
            is_block: false,
            user_id: user.id,
          },
          { transaction },
        );
      }

      token = this.jwtServices.generateToken(
        {
          id: user.id,
          lang_id: user.language_id,
          role_id: user.role_id,
          email: user.email ? user.email : null,
          phone_number: user.phone_number ? user.phone_number : null,
          device_id: userDevice.id,
        },
        process.env.TOKEN_SECRET_KEY as string,
        process.env.TOKEN_EXPIRES_IN as string,
      );

      refreshToken = this.jwtServices.generateToken(
        {
          id: user.id,
          lang_id: user.language_id,
          role_id: user.role_id,
          email: user.email ? user.email : null,
          phone_number: user.phone_number ? user.phone_number : null,
          device_id: userDevice.id,
        },
        process.env.REFRESH_TOKEN_SECRET_KEY as string,
        process.env.REFRESH_TOKEN_EXPIRES_IN as string,
      );

      let refreshCheck: any = await this.userRefreshTokenRepository.findOne({
        raw: true,
        attributes: ['id'],
        where: { user_id: user.id, device_id: userDevice.id },
      });

      if (refreshCheck) {
        await this.userRefreshTokenRepository.destroy({
          where: { id: refreshCheck.id },
          transaction,
        });
        await this.UserLogRepository.create(
          {
            _id: this.uuidService.generateUuid(),
            type: enumTypeOfLogs.LOGOUT,
            user_id: user.id,
            device_id: userDevice.id,
          },
          { transaction },
        );
        await this.redisService.deleteFromRedis(`${refreshCheck.id}`);
      }
      let createdRefreshToken: any =
        await this.userRefreshTokenRepository.create(
          {
            _id: this.uuidService.generateUuid(),
            token: refreshToken.token,
            fcm_token: fcm_token,
            user_id: user.id,
            device_id: userDevice.id,
            version_id: version.id,
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          { transaction },
        );
      await this.UserLogRepository.create(
        {
          _id: this.uuidService.generateUuid(),
          type: enumTypeOfLogs.LOGIN,
          user_id: user.id,
          device_id: userDevice.id,
        },
        { transaction },
      );
      await this.redisService.addToRedisCache(
        `${createdRefreshToken.id}`,
        `${token.jti}`,
        timeToSeconds(process.env.TOKEN_EXPIRES_IN as string),
      );
    });
    let checkAnotherDevice: UserRefreshToken[] =
      await this.userRefreshTokenRepository.findAll({
        raw: true,
        where: { user_id: user.id },
      });
    if (checkAnotherDevice.length > 1) {
      let fcmTokens: any = checkAnotherDevice.map((item: any) => {
        return item.fcm_token;
      });
      fcmTokens = Array.from(new Set(fcmTokens));

      FirebaseService.sendMultiNotification(
        fcmTokens,
        `Your account was logged in from device: ${body.device_name}`,
        `Is this you? If not, check your login and logout records`,
      );
    }
    sendHttpResponse(res, HttpStatus.OK, {
      message: `Hello , And welcome in  Basic Nestjs App 🙋‍♂️`,
      token: token.token,
      refresh_token: refreshToken.token,
      user_id: user._id,
      user_name: user.user_name,
      user_first_name: user.first_name,
      user_last_name: user.last_name,
      phone_number: user.phone_number,
      email: user.email,
      email_state: user.email_state,
      role_id: user.role._id,
      role_name: user.role.name,
      user_permissions: allPermissions,
    });
  }
  // _______________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async verification(
    req: Request,
    res: Response,
    body: VerificationDto,
  ): Promise<any> {
    const { email, verification_type, otp, new_password }: any = body;

    if (
      verification_type == enumVerificationType.RESETPASSWORD &&
      !new_password
    )
      throw new CustomException('You should send new password ');

    let user: any = await this.userRepository.findOne({
      raw: true,
      nest: true,
      include: [
        {
          model: this.RoleRepository,
          required: true,
          attributes: ['id', '_id', 'name'],
        },
      ],
      where: { email: email.trim() },
    });
    if (!user)
      throw new CustomException('The entered user name is incorrect ❌');

    const verifiedCode = await this.redisService.getFromRedisCache(
      `${email.trim()}`,
    );
    if (!verifiedCode) throw new CustomException('Sorry the time is up ⏰');
    if (otp !== verifiedCode)
      throw new CustomException('Sorry the otp is incorrect ❌');
    let deleteToken: UserRefreshToken[] | null = null;
    await this.sequelizeConnection.transaction(async (transaction: any) => {
      let updatedBody: any = { email_state: enumStateOfEmail.VERIFIED };

      if (verification_type == enumVerificationType.RESETPASSWORD) {
        updatedBody = {
          password: new_password,
          email_state: enumStateOfEmail.VERIFIED,
        };
        let refreshCheck: UserRefreshToken[] =
          await this.userRefreshTokenRepository.findAll({
            raw: true,
            attributes: ['id'],
            where: { user_id: user.id },
          });
        if (refreshCheck.length != 0) {
          await this.userRefreshTokenRepository.destroy({
            where: { user_id: user.id },
            transaction,
          });
          deleteToken = refreshCheck;
        }
      }

      await this.userRepository.update(updatedBody, {
        where: { id: user.id },
        transaction,
        individualHooks: true,
      });
    });
    await this.redisService.deleteFromRedis(`${email.trim()}`);
    if (deleteToken && deleteToken.length != 0) {
      await Promise.all(
        deleteToken.map(async (token: UserRefreshToken) => {
          await this.redisService.deleteFromRedis(`${token.id}`);
        }),
      );
    }

    sendHttpResponse(res, HttpStatus.OK, {
      message: `Please login again my friend`,
    });
  }
  // _______________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async sendCode(req: Request, res: Response, body: sendCodeDto): Promise<any> {
    let user: User = await this.userRepository.findOne({
      raw: true,
      attributes: ['id', 'role_id'],
      where: { email: body.email?.trim() },
    });

    if (!user) throw new CustomException('The entered email is incorrect ❌');

    const verifiedCode = crypto.randomInt(1000, 9999).toString();

    await this.redisService.addToRedisCache(
      `${body.email?.trim()}`,
      `${verifiedCode}`,
      5 * 60,
    );

    await this.mailerService.sendMail(
      'send_code',
      body.email?.trim(),
      `Otp verification is ${verifiedCode}`,
      { email: body.email.trim(), otp: verifiedCode },
    );

    sendHttpResponse(res, HttpStatus.OK, {
      message: `We send the OTP to you , please make verification `,
    });
  }
  // _______________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   */
  async signOut(req: Request, res: Response): Promise<any> {
    const userRefreshToken: any = await this.userRefreshTokenRepository.findOne(
      {
        raw: true,
        nest: true,
        attributes: ['id', 'user_id', 'device_id'],
        include: [
          {
            model: this.userDeviceRepository,
            required: true,
            attributes: [],
            where: { serial: req.device_serial, user_id: req.user.id },
          },
        ],
      },
    );

    await this.sequelizeConnection.transaction(async (transaction: any) => {
      await this.userRefreshTokenRepository.destroy({
        where: { id: userRefreshToken.id },
        transaction,
      });
      await this.UserLogRepository.create(
        {
          _id: this.uuidService.generateUuid(),
          type: enumTypeOfLogs.LOGOUT,
          user_id: userRefreshToken.user_id,
          device_id: userRefreshToken.device_id,
        },
        { transaction },
      );

      await this.userDeviceRepository.destroy({
        where: {
          id: userRefreshToken.device_id,
          serial: req.device_serial,
          user_id: req.user.id,
        },
        transaction,
      });

      this.redisService.deleteFromRedis(`${userRefreshToken.id}`);
    });

    sendHttpResponse(res, HttpStatus.OK, {
      message: `good bay my friend  `,
    });
  }
  // _______________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async refreshToken(
    req: Request,
    res: Response,
    body: RefreshTokenDto,
  ): Promise<any> {
    let refreshToken: string = body.refresh_token;
    let decoded: any;
    try {
      decoded = await this.jwtServices.verifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET_KEY,
      );
    } catch (error) {
      throw new CustomException('Invalid refresh token');
    }

    const user_id = decoded.id;

    let refreshTokenRaw: any = await this.userRefreshTokenRepository.findOne({
      raw: true,
      nest: true,
      include: [
        {
          model: this.userRepository,
          required: true,
        },
        {
          model: this.userDeviceRepository,
          required: true,
        },
      ],
      where: { user_id, device_id: decoded.device_id },
    });

    if (!refreshTokenRaw)
      throw new CustomException('You have logged out', HttpStatus.UNAUTHORIZED);

    let oldToken: any = refreshTokenRaw;

    let test = this.encryptionService.decryptToken(refreshTokenRaw.token);

    if (test !== refreshToken)
      throw new CustomException(
        'Invalid refresh token',
        HttpStatus.UNAUTHORIZED,
      );

    if (req.device_serial !== refreshTokenRaw.device.serial)
      throw new CustomException(
        'The serial dose not match the serial in token ',
      );

    let token: any = null;
    let newRefreshToken: any = refreshToken;

    await this.sequelizeConnection.transaction(async (transaction: any) => {
      if (new Date(refreshTokenRaw.expiry).getTime() < new Date().getTime()) {
        await this.userRefreshTokenRepository.destroy({
          where: { id: refreshTokenRaw.id },
          transaction,
        });
        await this.redisService.deleteFromRedis(`${refreshTokenRaw.id}`);

        newRefreshToken = this.jwtServices.generateToken(
          {
            id: refreshTokenRaw.user.id,
            language_id: refreshTokenRaw.user.language_id,
            role_id: refreshTokenRaw.user.role_id,
            email: refreshTokenRaw.user.email,
            phone_number: refreshTokenRaw.user.phone_number,
            device_id: decoded.device_id,
          },
          process.env.REFRESH_TOKEN_SECRET_KEY as string,
          process.env.REFRESH_TOKEN_EXPIRES_IN as string,
        );

        refreshTokenRaw = await this.userRefreshTokenRepository.create(
          {
            _id: this.uuidService.generateUuid(),
            token: newRefreshToken.token,
            user_id: refreshTokenRaw.user.id,
            device_id: decoded.device_id,
            version_id: refreshTokenRaw.version_id,
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          { transaction },
        );
      }
    });
    token = this.jwtServices.generateToken(
      {
        id: oldToken.user.id,
        language_id: oldToken.user.language_id,
        role_id: oldToken.user.role_id,
        email: oldToken.user.email,
        phone_number: oldToken.user.phone_number,
        device_id: decoded.device_id,
      },
      process.env.TOKEN_SECRET_KEY as string,
      process.env.TOKEN_EXPIRES_IN as string,
    );

    await this.redisService.addToRedisCache(
      `${refreshTokenRaw.id}`,
      `${token.jti}`,
      timeToSeconds(process.env.TOKEN_EXPIRES_IN as string),
    );
    sendHttpResponse(res, HttpStatus.OK, {
      message: `Hello , this is new tokens , please do not share it with anybody`,
      token: token.token,
      refresh_token: newRefreshToken.token
        ? newRefreshToken.token
        : newRefreshToken,
    });
  }
  // _______________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async changePass(req: Request, res: Response, body: changePassDto) {
    const user = await this.userRepository.findOne({
      raw: true,
      where: { id: req.user.id },
    });

    if (!(await bcrypt.compare(body.old_password, user.password)))
      throw new CustomException('The entered old password is incorrect ');

    await this.userRepository.update(
      { password: body.new_password },
      { where: { id: req.user.id }, individualHooks: true },
    );

    const userRefreshTokens: UserRefreshToken[] =
      await this.userRefreshTokenRepository.findAll({
        raw: true,
        nest: true,
        attributes: ['id', 'user_id', 'device_id'],
        where: { user_id: req.user.id },
      });

    await this.sequelizeConnection.transaction(async (transaction: any) => {
      await this.userRefreshTokenRepository.destroy({
        where: { user_id: req.user.id },
        transaction,
      });

      if (userRefreshTokens && userRefreshTokens.length != 0) {
        await Promise.all(
          userRefreshTokens.map(async (token: UserRefreshToken) => {
            await this.UserLogRepository.create(
              {
                _id: this.uuidService.generateUuid(),
                type: enumTypeOfLogs.LOGOUT,
                user_id: token.user_id,
                device_id: token.device_id,
              },
              { transaction },
            );
            await this.redisService.deleteFromRedis(`${token.id}`);
          }),
        );
      }
    });

    // ! Send Response For Client
    sendHttpResponse(res, HttpStatus.OK, {
      message: `Please login again my friend`,
    });
  }
  // ____________________________________________
  /**
   *
   * @param req
   * @param res
   */
  async logs(req: Request, res: Response): Promise<any> {
    const logs: UserRefreshToken[] =
      await this.userRefreshTokenRepository.findAll({
        raw: true,
        nest: true,
        attributes: ['createdAt'],
        include: [
          {
            model: this.userDeviceRepository,
            required: true,
            attributes: ['_id', 'serial', 'name', 'os_type', 'is_block'],
            where: { user_id: req.user.id },
          },
        ],
        order: [['createdAt', 'DESC']],
      });

    let logsDevices: any = logs.map((item: UserRefreshToken) => {
      return {
        device_id: item.device._id,
        device_serial: item.device.serial,
        device_name: item.device.name,
        os_type: item.device.os_type,
        is_block: item.device.is_block,
        log_in: item.createdAt,
      };
    });

    sendHttpResponse(res, HttpStatus.OK, {
      devices: logsDevices,
    });
  }
  // ____________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async kickOut(req: Request, res: Response, body: IdDto): Promise<any> {
    const findDevice: UserDevice = await this.userDeviceRepository.findOne({
      raw: true,
      attributes: ['id', 'user_id'],
      where: { _id: body._id, user_id: req.user.id },
    });

    if (!findDevice) throw new CustomException('Not Found Device !');

    await this.userDeviceRepository.destroy({ where: { id: findDevice.id } });

    sendHttpResponse(res, HttpStatus.OK);
  }
}
