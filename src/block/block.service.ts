import { HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/entities/user.entity';
import { Sequelize } from 'sequelize-typescript';
import { UuidService } from 'src/common/services/uuid.service';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { CustomException } from 'src/common/constant/custom-error';
import { enumStateOfEmail } from 'src/common/enums/enums';
import { RedisService } from 'src/common/services/redis.service';
import { sendHttpResponse } from 'src/common/services/request.service';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { Op } from 'sequelize';
import {
  IdDto,
  IdParamsDto,
  PaginationWithSearchQueries,
} from 'src/common/global/dto/global.dto';
import { blockListQueryDto, IpBlockListQueryDto } from './dto/block_list.dto';
import {
  DeviceBlockDto,
  EmailBlockDto,
  IpBlockDto,
} from './dto/create-block.dto';

@Injectable()
export class BlockService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    @InjectModel(UserRefreshToken)
    private userRefreshTokenRepository: typeof UserRefreshToken,
    @InjectModel(UserDevice)
    private userDeviceRepository: typeof UserDevice,
    @InjectConnection() private sequelizeConnection: Sequelize,
    private readonly redisService: RedisService,
  ) {}
  // _________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async makeEmailBlock(req: Request, res: Response, body: EmailBlockDto) {
    const { user_id } = body;
    let object_state: any = { email_state: enumStateOfEmail.BLOCK };

    let user: User = await this.userRepository.findOne({
      raw: true,
      nest: true,
      attributes: ['id', 'email_state'],
      where: {
        _id: user_id,
      },
      include: [
        {
          model: this.userRefreshTokenRepository,
          required: false,
          attributes: ['id'],
        },
      ],
    });

    if (!user) throw new CustomException("Can't find any user with this id");

    if (user && user.email_state == enumStateOfEmail.BLOCK) {
      object_state = { email_state: enumStateOfEmail.VERIFIED };
    }

    await this.sequelizeConnection.transaction(async (transaction: any) => {
      await this.userRepository.update(object_state, {
        where: { id: user.id },
        transaction,
      });

      if (object_state.email_state == enumStateOfEmail.BLOCK) {
        await this.redisService.addToRedisCache(
          `blocked_email_${user.id}`,
          'the email is block',
          1000 * 60 * 60 * 24 * 30 * 360,
        );
      } else {
        await this.redisService.deleteFromRedis(`blocked_email_${user.id}`);
      }
    });

    sendHttpResponse(res, HttpStatus.OK, {
      message: 'operation accomplished successfully',
      is_email_blocked:
        object_state.email_state == enumStateOfEmail.BLOCK ? true : false,
    });
  }
  // _________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async makeDeviceBlock(req: Request, res: Response, body: DeviceBlockDto) {
    let object_state = { is_block: true };
    const { serial } = body;

    let user_device: UserDevice = await this.userDeviceRepository.findOne({
      raw: true,
      attributes: ['id', 'is_block', 'user_id'],
      where: { serial },
    });

    if (!user_device)
      throw new CustomException('Not found user device with this serial');

    if (user_device.is_block) object_state = { is_block: false };
    await this.sequelizeConnection.transaction(async (transaction: any) => {
      await this.userDeviceRepository.update(object_state, {
        where: { serial },
        transaction,
      });

      if (object_state.is_block) {
        await this.redisService.addToRedisCache(
          `blocked_serial_${serial}`,
          'the serial is block',
          1000 * 60 * 60 * 24 * 30 * 360,
        );
      } else {
        await this.redisService.deleteFromRedis(`blocked_serial_${serial}`);
      }
    });

    sendHttpResponse(res, HttpStatus.OK, {
      message: 'operation accomplished successfully',
      is_serial_blocked: object_state.is_block == true ? true : false,
    });
  }
  // _________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param query
   */
  async blockList(
    req: Request,
    res: Response,
    query: PaginationWithSearchQueries,
  ) {
    let { size, page, q } = query;

    let whereCon: any = {
      [Op.and]: [
        {
          [Op.or]: [
            { email_state: enumStateOfEmail.BLOCK },
            { '$UserDevices.is_block$': true },
          ],
        },
      ],
    };
    if (q) {
      whereCon[Op.and].push({
        [Op.or]: [
          { phone_number: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
          { _id: { [Op.eq]: q } },
        ],
      });
    }
    let { rows: blocked_users, count: total } =
      await this.userRepository.findAndCountAll({
        raw: true,
        nest: true,
        limit: +size,
        offset: (+page - 1) * +size,
        attributes: [
          '_id',
          'email',
          'email_state',
          [
            Sequelize.literal(
              `CASE WHEN email_state = 'block' THEN true ELSE false END`,
            ),
            'is_email_blocked',
          ],
        ],
        include: [
          {
            model: this.userDeviceRepository,
            required: false,
            attributes: ['_id', 'is_block', 'serial'],
          },
        ],
        where: whereCon,
        subQuery: false,
        order: [['id', 'DESC']],
      });

    sendHttpResponse(res, HttpStatus.OK, {
      blocked_users,
      total,
      page,
      perPage: +size,
      totalPages: Math.ceil(total / +size),
    });
  }
  // _________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async makeIpBlock(req: Request, res: Response, body: IpBlockDto) {
    const { ip } = body;
    let is_ip_blocked = false;

    let ipBlocked: string | null = await this.redisService.getFromRedisCache(
      `ipBlock:${ip}`,
    );
    if (ipBlocked) {
      await this.redisService.deleteFromRedis(`ipBlock:${ip}`);
    } else {
      is_ip_blocked = true;
      await this.redisService.addToRedisCache(
        `ipBlock:${ip}`,
        ip,
        24 * 60 * 60,
      );
    }

    sendHttpResponse(res, HttpStatus.OK, {
      message: 'operation accomplished successfully',
      is_ip_blocked,
    });
  }
  // _________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param query
   */
  async IpBlockList(req: Request, res: Response, query: IpBlockListQueryDto) {
    const { q } = query;

    const keys = await this.redisService.getKeysFromRedisCache('ipBlock:*');
    const ips = keys.map((k) => k.replace('ipBlock:', ''));
    sendHttpResponse(res, HttpStatus.OK, {
      blocked: ips,
      total: ips.length,
    });
  }
  // _________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async makeCountryBlock(req: Request, res: Response, body: any) {
    const { country } = body;
    let is_country_blocked = false;

    let countryBlocked: string | null =
      await this.redisService.getFromRedisCache(`ipCountryBlockList`);

    countryBlocked = JSON.parse(countryBlocked);

    console.log(countryBlocked);

    if (countryBlocked) {
      await this.redisService.deleteFromRedis(`ipCountryBlockList`);
    } else {
      is_country_blocked = true;

      await this.redisService.addToRedisCache(
        `ipCountryBlockList`,
        country,
        24 * 60 * 60,
      );
    }

    sendHttpResponse(res, HttpStatus.OK, {
      message: 'operation accomplished successfully',
      is_country_blocked,
    });
  }
}
