import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Repository, Sequelize } from 'sequelize-typescript';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { Language } from './languages/entities/language.entity';
// import { permissions_db } from './common/constant/permissions';
// import { PermissionTypes } from './permission/entities/permissionTypes.entity';
// import { Permission } from './permission/entities/permission.entity';
import { UuidService } from './common/services/uuid.service';
import { UserDevice } from './user/entities/user_device.entity';
import { Version } from './versions/entities/version.entity';
import { enumOsType } from './common/enums/enums';


@Injectable()
export class DefaultDataService {
  constructor(
    @InjectModel(User)
    private readonly UserRepository: Repository<User>,
    @InjectModel(Language)
    private readonly LanguageRepository: Repository<Language>,
    @InjectModel(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectModel(UserDevice)
    private userDeviceRepository: typeof UserDevice,
    @InjectModel(Version)
    private versionRepository: typeof Version,
    @InjectConnection() private sequelizeConnection: Sequelize,
    private readonly UuidServiceFunction: UuidService,
  ) {}

  async insertDefaultData(): Promise<void> {
    if (!(await this.roleRepository.findOne({ where: { id: 1 } }))) {
      let permissionTypes = [
        { name: 'role' },
        { name: 'company' },
        { name: 'users' },
      ];

      // allPermissions = permissions_db.map((item: any) => {
      //   return {
      //     mode: item.mode,
      //     description: item.description,
      //   };
      // });
      //

      let languages = [
        {
          name: 'اللغة العربية',
          lang_code: 'ar',
          _id: this.UuidServiceFunction.generateUuid(),
        },
        {
          name: 'اللغة الانكليزية',
          lang_code: 'en',
          _id: this.UuidServiceFunction.generateUuid(),
        },
        {
          name: 'اللغة الروسية',
          lang_code: 'ru',
          _id: this.UuidServiceFunction.generateUuid(),
        },
      ];
      await this.sequelizeConnection.transaction(async (transaction: any) => {
        //   await PermissionTypes.bulkCreate(permissionTypes, { transaction });
        //   await Permission.bulkCreate(permissions_db, { transaction });
        await this.versionRepository.bulkCreate([
          {
            _id: this.UuidServiceFunction.generateUuid(),
            app_version: '0.0.1',
            description: 'this the first version of apk version',
            app_type: enumOsType.ANDROID,
            app_name: 'jobs.apk',
          },
          {
            _id: this.UuidServiceFunction.generateUuid(),
            app_version: '0.0.1',
            description: 'this the first version of ios version',
            app_type: enumOsType.IOS,
            app_name: 'jobs.ios',
          },
          {
            _id: this.UuidServiceFunction.generateUuid(),
            app_version: '0.0.1',
            description: 'this the first version of exe version',
            app_type: enumOsType.WINDOWS,
            app_name: 'jobs.exe',
          },
        ]);
        //
        await this.LanguageRepository.bulkCreate(languages, { transaction });
        await this.roleRepository.bulkCreate(
          [
            {
              name: 'super_admin',
              _id: this.UuidServiceFunction.generateUuid(),
            },
            {
              name: 'user',
              _id: this.UuidServiceFunction.generateUuid(),
            },
            {
              name: 'admin',
              _id: this.UuidServiceFunction.generateUuid(),
            },
          ],
          { transaction },
        );

        //   let create_admin_permissions = [];
        //   create_admin_permissions = admin_permissions.map((item) => {
        //     return {
        //       role_id: admin.id,
        //       permission_id: item,
        //     };
        //   });

        //   let create_author_permissions = [];
        //   create_author_permissions = author_permissions.map((item) => {
        //     return {
        //       role_id: author.id,
        //       permission_id: item,
        //     };
        //   });
        //   let create_reviewer_permissions = [];
        //   create_reviewer_permissions = reviewer_permissions.map((item) => {
        //     return {
        //       role_id: reviewer.id,
        //       permission_id: item,
        //     };
        //   });

        //   await RolePermission.bulkCreate(create_admin_permissions, {
        //     transaction,
        //   });
        //   await RolePermission.bulkCreate(create_author_permissions, {
        //     transaction,
        //   });
        //   await RolePermission.bulkCreate(create_reviewer_permissions, {
        //     transaction,
        //   });

        const default_admin = await this.UserRepository.create(
          {
            name: 'mohamad',
            email: 'mohamad2129880@gmail.com',
            role_id: 1,
            lang_id: 1,
            _id: this.UuidServiceFunction.generateUuid(),
          },
          { transaction },
        );

        const user = await this.UserRepository.create(
          {
            name: 'noor',
            email: 'mohamad2114341@gmail.com',
            role_id: 2,
            lang_id: 1,
            _id: this.UuidServiceFunction.generateUuid(),
          },
          { transaction },
        );
      });
    }
  }
}
