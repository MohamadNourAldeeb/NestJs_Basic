import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Request, Response } from 'express';
import { Version } from './entities/version.entity';
import { ActivityLog } from 'src/user/entities/activity_log.entity';
import { UuidService } from 'src/common/services/uuid.service';
import { RedisService } from 'src/common/services/redis.service';
import { Sequelize } from 'sequelize-typescript';
import { CreateVersionDto } from './dto/create-version.dto';
import { CustomException } from 'src/common/constant/custom-error';
import {
  enumOsType,
  enumPriority,
  enumTypeOfActivity,
} from 'src/common/enums/enums';
import { sendHttpResponse } from 'src/common/services/request.service';
import { compareVersions } from 'src/common/utilis/helper';
import { Transaction } from 'sequelize';
import { IdDto } from 'src/common/global/dto/global.dto';

@Injectable()
export class VersionsService {
  constructor(
    @InjectModel(Version)
    private VersionRepository: typeof Version,
    @InjectModel(ActivityLog)
    private ActivityLogRepository: typeof ActivityLog,
    private readonly UuidServiceFunction: UuidService,
    private readonly redisService: RedisService,
    @InjectConnection() private sequelizeConnection: Sequelize,
  ) {}
  // _________________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async addNewAppVersion(
    req: Request,
    res: Response,
    body: CreateVersionDto,
  ): Promise<any> {
    let versionCheck: Version = await this.VersionRepository.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        app_version: body.app_version,
        app_type: body.app_type,
      },
    });
    if (versionCheck)
      throw new CustomException('the version is already exists');

    let lastVersion: Version = await this.VersionRepository.findOne({
      raw: true,
      attributes: ['id', 'app_version'],
      where: {
        app_type: body.app_type,
      },
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    if (
      lastVersion &&
      !compareVersions(lastVersion.app_version, body.app_version)
    )
      throw new CustomException(
        'the version should grater than latest version',
      );

    await this.sequelizeConnection.transaction(
      async (transaction: Transaction) => {
        await this.VersionRepository.create(
          { _id: this.UuidServiceFunction.generateUuid(), ...body },
          { transaction },
        );

        await this.ActivityLogRepository.create(
          {
            _id: this.UuidServiceFunction.generateUuid(),
            type: enumTypeOfActivity.VERSION,
            priority: enumPriority.HIGHT,
            operation: `add new App Versions :${body.app_version}`,
            user_id: req.user.id,
          },
          { transaction },
        );
      },
    );

    // add to redis
    // ! Should add latest version of devices
    let ios: Version = await this.VersionRepository.findOne({
      raw: true,
      where: { app_type: enumOsType.IOS },
      order: [['id', 'DESC']],
    });
    let android: Version = await this.VersionRepository.findOne({
      raw: true,
      where: { app_type: enumOsType.ANDROID },
      order: [['id', 'DESC']],
    });
    let windows: Version = await this.VersionRepository.findOne({
      raw: true,
      where: { app_type: enumOsType.WINDOWS },
      order: [['id', 'DESC']],
    });
    let web: Version = await this.VersionRepository.findOne({
      raw: true,
      where: { app_type: enumOsType.WEB },
      order: [['id', 'DESC']],
    });
    await this.redisService.addToRedisCache(
      'latest_application_version',
      JSON.stringify({
        ios,
        android,
        windows,
        web,
      }),
    );
    // ! Send Response For Client
    sendHttpResponse(res, HttpStatus.OK);
  }
  // _________________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   */
  async findAll(req: Request, res: Response): Promise<any> {
    let versions: Version[] = await this.VersionRepository.findAll({
      raw: true,
      attributes: { exclude: ['id', 'updatedAt'] },
      order: [['id', 'DESC']],
    });

    // ! Send Response For Client
    sendHttpResponse(res, HttpStatus.OK, versions);
  }
  // _________________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param _id
   */
  async remove(req: Request, res: Response, _id: IdDto): Promise<any> {
    let checkId: Version = await this.VersionRepository.findOne({
      raw: true,
      attributes: ['id', 'app_type'],
      where: { _id },
    });
    if (!checkId)
      throw new CustomException("Can't find any Version like this id");

    let countOfThisType: number = await this.VersionRepository.count({
      attributes: ['id'],
      where: {
        app_type: checkId.app_type,
      },
    });
    if (countOfThisType == 1)
      throw new CustomException(
        'you cant change type of this version because you have just one version for this type of device',
      );

    await this.sequelizeConnection.transaction(
      async (transaction: Transaction) => {
        await this.VersionRepository.destroy({
          where: { id: checkId.id },
          transaction,
        });
        await this.ActivityLogRepository.create(
          {
            _id: this.UuidServiceFunction.generateUuid(),
            type: enumTypeOfActivity.VERSION,
            priority: enumPriority.HIGHT,
            operation: `delete App Versions with id:${_id}`,
            user_id: req.user.id,
          },
          { transaction },
        );
      },
    );

    // add to redis
    // ! Should add latest version of devices
    let ios: Version = await this.VersionRepository.findOne({
      raw: true,
      where: { app_type: enumOsType.IOS },
      order: [['id', 'DESC']],
    });
    let android: Version = await this.VersionRepository.findOne({
      raw: true,
      where: { app_type: enumOsType.ANDROID },
      order: [['id', 'DESC']],
    });
    let windows: Version = await this.VersionRepository.findOne({
      raw: true,
      where: { app_type: enumOsType.WINDOWS },
      order: [['id', 'DESC']],
    });
    let web: Version = await this.VersionRepository.findOne({
      raw: true,
      where: { app_type: enumOsType.WEB },
      order: [['id', 'DESC']],
    });
    await this.redisService.addToRedisCache(
      'latest_application_version',
      JSON.stringify({
        ios,
        android,
        windows,
        web,
      }),
    );
    // ! Send Response For Client
    sendHttpResponse(res, HttpStatus.OK);
  }
}
