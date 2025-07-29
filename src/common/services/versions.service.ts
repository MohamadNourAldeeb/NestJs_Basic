import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Version } from 'src/versions/entities/version.entity';
import { enumOsType, enumVersionPriority } from '../enums/enums';

@Injectable()
export class CheckVersionService {
  constructor(
    @InjectModel(Version)
    private versionRepository: typeof Version,
  ) {}

  async checkVersion(version: string, appType: enumOsType): Promise<any> {
    let last_version = await this.versionRepository.findOne({
      raw: true,
      order: [['id', 'DESC']],
      where: { app_type: appType },
    });
    let app_version = {
      state: 'Already_updated',
      last_version: last_version.app_version,
      description: last_version.description,
      createdAt: last_version.createdAt,
      expiredAt: null,
      link: process.env.LINK + '/apps/' + last_version.app_name.trim(),
      should_update: false,
    };

    if (
      version != last_version.app_version &&
      last_version.priority == enumVersionPriority.NECESSARY
    ) {
      app_version.state = 'Necessary_update';
      app_version.should_update = true;
      app_version.expiredAt = last_version.expiredAt;
    }

    if (
      version != last_version.app_version &&
      last_version.priority == enumVersionPriority.OPTIONAL
    ) {
      app_version.state = 'Optional_update';
      app_version.expiredAt = last_version.expiredAt;
    }

    return app_version;
  }
}
