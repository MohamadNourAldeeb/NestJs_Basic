import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Request, Response } from 'express';
import { Role } from './entities/role.entity';
import { CustomException } from 'src/common/constant/custom-error';
import { Permission } from 'src/permission/entities/permission.entity';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { RolePermission } from './entities/roles_permissions.entity';

import { Op } from 'sequelize';
import { sendHttpResponse } from 'src/common/services/request.service';
import { UuidService } from 'src/common/services/uuid.service';
import { IdDto } from 'src/common/global/dto/global.dto';

let findDifference = (arr1: any[], arr2: any[]) => {
  const forDelete = arr1.filter((item: any) => !arr2.includes(item));
  const forCreate = arr2.filter((item: any) => !arr1.includes(item));
  return { forDelete, forCreate };
};

@Injectable()
export class RoleService {
  constructor(
    @InjectConnection() private sequelizeConnection: Sequelize,
    private readonly UuidServiceFunction: UuidService,
  ) {}
  async create(createRoleDto: CreateRoleDto, req: Request, res: Response) {
    createRoleDto.permissions = Array.from(new Set(createRoleDto.permissions));
    if (
      await Role.findOne({
        raw: true,
        where: { name: createRoleDto.role_name },
      })
    )
      throw new CustomException(`this role already exist 🤨`);

    if (createRoleDto.permissions.length == 0)
      throw new CustomException(
        `you should add some permissions to this role🤨`,
      );

    let permissionsIds = [];
    await Promise.all(
      createRoleDto.permissions.map(async (item: any) => {
        let check = await Permission.findOne({
          raw: true,
          attributes: ['id'],
          where: { _id: item },
        });
        if (!check)
          throw new CustomException(`this permission Id ${item} not found 🤨`);
        permissionsIds.push(check.id);
      }),
    );

    await this.sequelizeConnection.transaction(async (transaction: any) => {
      //! start validation of _id
      let _id = this.UuidServiceFunction.generateUuid();
      let checkUuid = await Role.findOne({
        where: {
          _id,
        },
      });
      while (checkUuid) {
        _id = this.UuidServiceFunction.generateUuid();
        let checkUuid = await Role.findOne({
          where: {
            _id,
          },
        });
        if (!checkUuid) break;
      }
      //! end start validation of _id

      let role: any = await Role.create(
        {
          name: createRoleDto.role_name,
          _id,
        },
        { transaction },
      );

      let permissions_role_creation = [];
      permissions_role_creation = permissionsIds.map((item: any) => {
        return {
          role_id: role.id,
          permission_id: item,
        };
      });
      await RolePermission.bulkCreate(permissions_role_creation, {
        transaction,
      });
    });

    sendHttpResponse(res, HttpStatus.OK);
  }
  async findAll(req: Request, res: Response) {
    let data: any = await Role.findAll({
      raw: true,
      nest: true,
      include: [
        {
          model: RolePermission,
          required: true,
          attributes: [],
          include: [
            {
              model: Permission,
              required: true,
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
          ],
        },
      ],
      
    });

    data = data.reduce((acc: any, item: any) => {
      const existingItem = acc.find((x: any) => x._id === item._id);

      if (existingItem) {
        if (
          !existingItem.permissions.includes({
            _id: item.permissions.permission._id,
          }) &&
          item.permissions.permission._id
        ) {
          existingItem.permissions.push({
            _id: item.permissions.permission._id,
            mode: item.permissions.permission.mode,
            description: item.permissions.permission.description,
          });
        }
      } else {
        let permissions: any = [];
        if (permissions.length == 0)
          permissions.push({
            _id: item.permissions.permission._id,
            mode: item.permissions.permission.mode,
            description: item.permissions.permission.description,
          });
        acc.push({
          _id: item._id,
          name: item.name,
          permissions,
        });
      }
      return acc;
    }, []);

    sendHttpResponse(res, HttpStatus.OK, data);
  }
  async update(
    _id: IdDto,
    updateRoleDto: UpdateRoleDto,
    req: Request,
    res: Response,
  ) {
    updateRoleDto.permissions = Array.from(new Set(updateRoleDto.permissions));
    if (updateRoleDto.permissions.length == 0)
      throw new CustomException(
        `you should add some permissions to this role🤨`,
      );
    if (
      await Role.findOne({
        raw: true,
        where: {
          name: updateRoleDto.role_name,
          _id: { [Op.not]: _id },
        },
      })
    )
      throw new CustomException(`this role name already exist 🤨`);

    await Promise.all(
      updateRoleDto.permissions.map(async (item: any) => {
        if (
          !(await Permission.findOne({
            raw: true,
            attributes: ['id'],
            where: { _id: item },
          }))
        )
          throw new CustomException(`this permission Id ${item} not found 🤨`);
      }),
    );

    await this.sequelizeConnection.transaction(async (transaction: any) => {
      await Role.update(
        { name: updateRoleDto.role_name },
        { where: { _id }, transaction },
      );
      let role_permission: any = await RolePermission.findAll({
        raw: true,
        where: { role_id: _id },
      });
      role_permission = role_permission.map((item: any) => item.permission_id);
      let different = findDifference(
        role_permission,
        updateRoleDto.permissions,
      );
      if (different.forCreate.length != 0) {
        await Promise.all(
          different.forCreate.map(async (item: any) => {
            await RolePermission.create(
              { role_id: _id, permission_id: item },
              { transaction },
            );
          }),
        );
      }
      if (different.forDelete.length != 0) {
        await Promise.all(
          different.forDelete.map(async (item: any) => {
            await RolePermission.destroy({
              where: { permission_id: item, role_id: _id },
              transaction,
            });
          }),
        );
      }
    });

    sendHttpResponse(res, HttpStatus.OK);
  }
  async remove(_id: IdDto, req: Request, res: Response) {
    if (
      !(await Role.findOne({
        raw: true,
        where: {
          _id,
       
        },
      }))
    )
      throw new CustomException(`this role not found 🤨`);

    await RolePermission.destroy({ where: { role_id: _id } });

    await Role.destroy({ where: { _id } });

    sendHttpResponse(res, HttpStatus.OK);
  }
}
