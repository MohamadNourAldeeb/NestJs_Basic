import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Request, Response } from 'express';
import { Permission } from './entities/permission.entity';
import { Op } from 'sequelize';
import { CustomException } from 'src/common/constant/custom-error';
@Injectable()
export class PermissionService {
  async create(
    createPermissionDto: CreatePermissionDto,
    req: Request,
    res: Response,
  ) {
    if (
      await Permission.findOne({
        raw: true,
        where: {
          mode: createPermissionDto.mode,
          description: createPermissionDto.description,
        },
      })
    )
      throw new CustomException('this permission already exist 😊');

    await Permission.create({ ...createPermissionDto });

    return res.status(HttpStatus.CREATED).send({
      success: true,
      data: {
        message: 'operation accomplished successfully',
      },
    });
  }

  async findAll(req: Request, res: Response) {
    let data: any = await Permission.findAll({
      raw: true,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });

    return res.status(HttpStatus.OK).send({
      success: true,
      data,
    });
  }
  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
    req: Request,
    res: Response,
  ) {
    if (
      !(await Permission.findOne({
        raw: true,
        where: {
          id,
        },
      }))
    )
      throw new CustomException('this permission not found 😊');
    if (
      await Permission.findOne({
        raw: true,
        where: {
          mode: updatePermissionDto.mode,
          description: updatePermissionDto.description,
          id: { [Op.not]: id },
        },
      })
    )
      throw new CustomException('this permission info already exist 😊');
    await Permission.update({ ...updatePermissionDto }, { where: { id } });

    return res.status(HttpStatus.OK).send({
      success: true,
      data: {
        message: 'operation accomplished successfully',
      },
    });
  }

  async remove(id: number, req: Request, res: Response) {
    if (
      !(await Permission.findOne({
        raw: true,
        where: {
          id,
        },
      }))
    )
      throw new CustomException('this permission not found 😊');

    await Permission.destroy({ where: { id } });
    return res.status(HttpStatus.OK).send({
      success: true,
      data: {
        message: 'operation accomplished successfully',
      },
    });
  }
}
