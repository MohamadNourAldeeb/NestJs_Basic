import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { UserPermission } from './entities/user_permission.entity';
import { Sequelize } from 'sequelize-typescript';
import { RolePermission } from '../role/entities/roles_permissions.entity';
import { Op, Transaction } from 'sequelize';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { Language } from 'src/languages/entities/language.entity';
import { sendHttpResponse } from 'src/common/services/request.service';
import { ActivityLog } from './entities/activity_log.entity';
import { CustomException } from 'src/common/constant/custom-error';
import { UuidService } from 'src/common/services/uuid.service';
import {
  commonArrayElements,
  generatePassword,
} from 'src/common/utilis/helper';
import { enumUserPermissionsType } from 'src/common/enums/enums';
import { MailService } from 'src/mailer/mailer.service';
import { RedisService } from 'src/common/services/redis.service';
import { UserRefreshToken } from './entities/user_refresh_token.entity';
import * as bcrypt from 'bcrypt';
import { GetAllActivityLogDto } from './dto/get-all-activity_log.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    @InjectModel(ActivityLog)
    private ActivityLogRepository: typeof ActivityLog,
    @InjectModel(Role)
    private roleRepository: typeof Role,
    @InjectModel(RolePermission)
    private RolePermissionRepository: typeof RolePermission,
    @InjectModel(UserPermission)
    private UserPermissionRepository: typeof UserPermission,
    @InjectModel(UserRefreshToken)
    private UserRefreshTokenRepository: typeof UserRefreshToken,
    @InjectModel(Permission)
    private PermissionRepository: typeof Permission,
    @InjectModel(Language)
    private languageRepository: typeof Language,
    private readonly UuidServiceFunction: UuidService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    @InjectConnection() private sequelizeConnection: Sequelize,
  ) {}
  // _______________________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async create(req: Request, res: Response, body: CreateUserDto): Promise<any> {
    let bodyIncludePermissions: any = Array.from(
      new Set(body.include_permissions),
    );
    let bodyExcludePermissions: any = Array.from(
      new Set(body.exclude_permissions),
    );
    let same = commonArrayElements(
      bodyIncludePermissions,
      bodyExcludePermissions,
    );
    if (same.length != 0)
      throw new CustomException('you send same id in includes and excludes');

    if (
      body.email.trim() &&
      (await this.userRepository.findOne({
        raw: true,
        attributes: ['id'],
        where: { email: body.email.trim() },
      }))
    )
      throw new CustomException('this email already exist');
    if (
      await this.userRepository.findOne({
        raw: true,
        attributes: ['id'],
        where: { user_name: body.user_name.trim() },
      })
    )
      throw new CustomException('this user_name already exist');
    if (
      body.phone_number &&
      (await this.userRepository.findOne({
        raw: true,
        attributes: ['id'],
        where: { phone_number: body.phone_number.trim() },
      }))
    )
      throw new CustomException('this phone_number already exist');

    const role: any = await this.roleRepository.findOne({
      raw: true,
      attributes: ['id', 'name'],
      where: { _id: body.role_id },
    });
    if (!role) throw new CustomException('this role ID is incorrect');
    if (role.id == 1)
      throw new CustomException(
        "You can't create account with super admin role ",
      );

    // get default role for user
    let rolePermissions: any = await RolePermission.findAll({
      raw: true,
      attributes: ['permission_id'],
      where: { role_id: role.id },
    });
    rolePermissions = rolePermissions.map((item: any) => item.permission_id);

    let userPermissions: any = rolePermissions;
    let include_permissions = [];
    let exclude_permissions = [];

    await Promise.all(
      bodyExcludePermissions.map(async (item: any) => {
        let perm = await Permission.findOne({
          raw: true,
          attributes: ['id'],
          where: { id: item },
        });
        if (!perm)
          throw new CustomException(
            `this ${item} 'ID  is not correct permission`,
          );
        if (!rolePermissions.includes(perm.id))
          throw new CustomException(
            `this ${item} 'ID in exclude_permissions is not found in this role:${role.name}`,
          );
        exclude_permissions.push(perm.id);
        userPermissions = userPermissions.filter(
          (perm: number) => perm != item.id,
        );
      }),
    );

    await Promise.all(
      bodyIncludePermissions.map(async (item: any) => {
        let perm = await Permission.findOne({
          raw: true,
          attributes: ['id'],
          where: { id: item },
        });
        if (!perm)
          throw new CustomException(
            `this ${item} 'ID  is not correct permission`,
          );
        if (rolePermissions.includes(perm.id))
          throw new CustomException(
            `this ${item} 'ID in include_permissions is already found in this role:${role.name}`,
          );

        userPermissions.push(perm.id);
      }),
    );
    let password: string = generatePassword(body.user_name);
    let user: User | null = null;

    await this.sequelizeConnection.transaction(async (transaction: any) => {
      if (body.password) password = body.password;
      if (body.email?.trim() && !body.password) {
        let emailSending: any = await this.mailService.sendMail(
          'send_password',
          body.email?.trim(),
          'please reset password as soon as possible',
          { user_name: body.user_name?.trim(), password: password },
        );
        if (emailSending.state == 'fail')
          throw new CustomException(`${emailSending.message}`);
      }

      user = await this.userRepository.create(
        {
          _id: this.UuidServiceFunction.generateUuid(),
          user_name: body.user_name,
          email: body.email,
          phone_number: body.phone_number,
          password,
          first_name: body.first_name,
          last_name: body.last_name,
          language_id: 1,
          role_id: role.id,
        },
        { transaction },
      );

      let create_extra_permissions = [];
      if (exclude_permissions.length != 0)
        exclude_permissions.map((item) => {
          create_extra_permissions.push({
            user_id: user.id,
            permission_id: item,
            status: enumUserPermissionsType.EXCLUDE,
          });
        });
      if (include_permissions.length != 0)
        include_permissions.map((item) => {
          create_extra_permissions.push({
            user_id: user.id,
            permission_id: item,
            status: enumUserPermissionsType.INCLUDE,
          });
        });
      await UserPermission.bulkCreate(create_extra_permissions, {
        transaction,
      });
    });

    if (!user) throw new CustomException('somethings went wrong ');

    sendHttpResponse(res, HttpStatus.CREATED, {
      message: 'operation accomplished successfully ',
      user_id: user._id,
      user_email: user.email,
      user_name: user.user_name,
      email_state: user.email_state,
      role_id: body.role_id,
      role_name: role.name,
      phone_number: user.phone_number,
      user_permissions: userPermissions,
      createdAt: user.createdAt,
    });
  }
  // _______________________________________________________________________________________
  /**
   *
   * @param _id
   * @param req
   * @param res
   * @param body
   */
  async update(
    _id: string,
    req: Request,
    res: Response,
    body: UpdateUserDto,
  ): Promise<any> {
    let user: User = await this.userRepository.findOne({
      raw: true,
      attributes: ['id'],
      where: { _id },
    });

    if (!user) throw new CustomException('this user ID is incorrect ');

    let bodyIncludePermissions: number[] = Array.from(
      new Set(body.include_permissions),
    );
    let bodyExcludePermissions: number[] = Array.from(
      new Set(body.exclude_permissions),
    );
    let same = commonArrayElements(
      bodyIncludePermissions,
      bodyExcludePermissions,
    );
    if (same.length != 0)
      throw new CustomException('you send same id in includes and excludes');

    if (
      body.email.trim() &&
      (await this.userRepository.findOne({
        raw: true,
        attributes: ['id'],
        where: { email: body.email.trim(), _id: { [Op.not]: _id } },
      }))
    )
      throw new CustomException('this email already exist');

    if (
      body.user_name.trim() &&
      (await this.userRepository.findOne({
        raw: true,
        attributes: ['id'],
        where: { user_name: body.user_name.trim(), _id: { [Op.not]: _id } },
      }))
    )
      throw new CustomException('this user_name already exist');

    if (
      body.phone_number.trim() &&
      (await this.userRepository.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          phone_number: body.phone_number.trim(),
          _id: { [Op.not]: _id },
        },
      }))
    )
      throw new CustomException('this phone_number already exist');

    const role: any = await this.roleRepository.findOne({
      raw: true,
      attributes: ['id', 'name'],
      where: { _id: body.role_id },
    });
    if (!role) throw new CustomException('this role ID is incorrect');
    if (role.id == 1)
      throw new CustomException(
        "You can't create account with super admin role ",
      );

    // get default role for user
    let rolePermissions: any = await this.RolePermissionRepository.findAll({
      raw: true,
      attributes: ['permission_id'],
      where: { role_id: role.id },
    });
    rolePermissions = rolePermissions.map((item: any) => item.permission_id);

    let userPermissions = await this.UserPermissionRepository.findAll({
      raw: true,
      attributes: ['permission_id', 'status'],
      where: { user_id: user.id },
    });
    let userIncludePermissions: number[] = [];
    let userExcludePermissions: number[] = [];

    userPermissions.map((item) => {
      if (item.status == enumUserPermissionsType.INCLUDE)
        userIncludePermissions.push(item.permission_id);
      else userExcludePermissions.push(item.permission_id);
    });
    let allPermissions = rolePermissions.filter(
      (item: any) => !userExcludePermissions.includes(item),
    );
    allPermissions = allPermissions.concat(userIncludePermissions);

    let includePermissions: number[] = [];
    let excludePermissions: number[] = [];
    let deletedPermission: number[] = [];

    await Promise.all(
      bodyExcludePermissions.map(async (item: number) => {
        let permission: any = await this.PermissionRepository.findOne({
          raw: true,
          attributes: ['id'],
          where: { id: item },
        });
        if (!permission)
          throw new CustomException(
            `this ${item} 'ID is not correct permission`,
          );

        if (!allPermissions.includes(permission.id))
          throw new CustomException(
            `this ${item} 'ID in exclude permissions is not found in this role:${role.name} or in the user permissions`,
          );

        if (userIncludePermissions.includes(permission.id)) {
          deletedPermission.push(permission.id);
        } else {
          excludePermissions.push(permission.id);
        }
      }),
    );

    await Promise.all(
      bodyIncludePermissions.map(async (item: number) => {
        let permission = await this.PermissionRepository.findOne({
          raw: true,
          attributes: ['id'],
          where: { id: item },
        });
        if (!permission)
          throw new CustomException(
            `this ${item} 'ID  is not correct permission`,
          );

        if (allPermissions.includes(permission.id))
          throw new CustomException(
            `this ${item} 'ID in include permissions is already found in this or in the user permissions`,
          );

        if (userExcludePermissions.includes(permission.id)) {
          deletedPermission.push(permission.id);
        } else {
          includePermissions.push(permission.id);
        }
      }),
    );

    let userUpdatedBody: any = {
      user_name: body.user_name?.trim(),
      first_name: body.first_name?.trim(),
      last_name: body.last_name?.trim(),
      email: body.email,
      password: body.password
        ? await bcrypt.hash(body.password, 10)
        : user.password,
      role_id: role.id,
    };
    if (body.phone_number)
      userUpdatedBody.phone_number = body.phone_number?.trim();

    await this.sequelizeConnection.transaction(
      async (transaction: Transaction) => {
        await this.userRepository.update(userUpdatedBody, {
          where: { id: user.id },
          transaction,
        });
        let createExtraPermissions = [];

        if (excludePermissions.length != 0)
          excludePermissions.map((item) => {
            createExtraPermissions.push({
              _id: this.UuidServiceFunction.generateUuid(),
              user_id: user.id,
              permission_id: item,
              status: enumUserPermissionsType.EXCLUDE,
            });
          });
        if (includePermissions.length != 0)
          includePermissions.map((item) => {
            createExtraPermissions.push({
              _id: this.UuidServiceFunction.generateUuid(),
              user_id: user.id,
              permission_id: item,
              status: enumUserPermissionsType.INCLUDE,
            });
          });

        await this.UserPermissionRepository.destroy({
          where: {
            permission_id: { [Op.in]: deletedPermission },
            user_id: user.id,
          },
          transaction,
        });

        await this.UserPermissionRepository.bulkCreate(createExtraPermissions, {
          transaction,
        });
      },
    );

    sendHttpResponse(res, HttpStatus.OK);
  }
  // _______________________________________________________________________________________
  /**
   *
   * @param _id
   * @param req
   * @param res
   */
  async remove(_id: string, req: Request, res: Response): Promise<any> {
    let user: User = await this.userRepository.findOne({
      raw: true,
      attributes: ['id'],
      where: { _id },
    });

    if (!user) throw new CustomException('this user ID is incorrect ');

    if (user.role_id == 1)
      throw new CustomException("You can't delete super admin ");

    await this.sequelizeConnection.transaction(
      async (transaction: Transaction) => {
        await this.userRepository.destroy({
          where: { id: user.id },
          force: true,
        });

        let userRefreshTokens: UserRefreshToken[] =
          await this.UserRefreshTokenRepository.findAll({
            raw: true,
            attributes: ['id'],
            where: { user_id: user.id },
          });

        if (userRefreshTokens.length != 0) {
          await this.UserRefreshTokenRepository.destroy({
            where: { user_id: user.id },
          });
        }

        await Promise.all(
          userRefreshTokens.map(async (token: UserRefreshToken) => {
            await this.redisService.deleteFromRedis(`${token.id}`);
          }),
        );
      },
    );

    sendHttpResponse(res, HttpStatus.OK);
  }
  // _____________________________________________________s__________________________________
  /**
   *
   * @param req
   * @param res
   * @param query
   */
  async findAll(
    req: Request,
    res: Response,
    query: GetAllUserDto,
  ): Promise<any> {
    let { size, page, q, role } = query;
    let whereConditions: any = { role_id: { [Op.not]: 1 } };
    if (q) {
      whereConditions = {
        role_id: { [Op.not]: 1 },
        [Op.or]: [
          {
            user_name: { [Op.like]: `%${q}%` },
          },
          {
            email: { [Op.like]: `%${q}%` },
          },
          {
            phone_number: { [Op.like]: `%${q}%` },
          },
          {
            _id: { [Op.eq]: `${q}` },
          },
        ],
      };
    }

    if (role) {
      const dbRole: Role = await this.roleRepository.findOne({
        attributes: ['id'],
        where: { name: role },
      });
      if (!dbRole) throw new CustomException('the role name is incorrect ');
      whereConditions.role_id = dbRole.id;
    }

    let { count: total, rows: users } =
      await this.userRepository.findAndCountAll({
        raw: true,
        nest: true,
        limit: +size,
        offset: (+page - 1) * +size,
        attributes: {
          exclude: ['updatedAt', 'password', 'id', 'role_id', 'language_id'],
        },
        include: [
          {
            model: this.roleRepository,
            required: true,
            attributes: ['_id', 'name'],
          },
          {
            model: this.languageRepository,
            required: true,
            attributes: ['name', '_id'],
          },
        ],
        where: whereConditions,

        order: [['createdAt', 'DESC']],
      });

    sendHttpResponse(res, HttpStatus.OK, {
      users,
      total,
      page,
      perPage: +size,
      totalPages: Math.ceil(total / +size),
    });
  }

  // _____________________________________________________s__________________________________
  /**
   *
   * @param req
   * @param res
   * @param query
   */
  async findAllActivityLog(
    req: Request,
    res: Response,
    query: GetAllActivityLogDto,
  ): Promise<any> {
    let { size, page, q, type, priority } = query;
    let whereConditions: any = {};
    if (q) {
      whereConditions = {
        [Op.or]: [
          {
            operation: { [Op.like]: `%${q}%` },
          },
          {
            _id: { [Op.eq]: `${q}` },
          },
        ],
      };
    }

    if (type) {
      whereConditions.type = type;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

    let { count: total, rows: activities } =
      await this.ActivityLogRepository.findAndCountAll({
        raw: true,
        nest: true,
        limit: +size,
        offset: (+page - 1) * +size,
        attributes: {
          exclude: ['updatedAt', 'id', 'user_id'],
        },
        include: [
          {
            model: this.userRepository,
            required: true,
            attributes: [
              '_id',
              'user_name',
              'email',
              'first_name',
              'last_name',
            ],
          },
        ],
        where: whereConditions,

        order: [['createdAt', 'DESC']],
      });

    sendHttpResponse(res, HttpStatus.OK, {
      activities,
      total,
      page,
      perPage: +size,
      totalPages: Math.ceil(total / +size),
    });
  }
}
