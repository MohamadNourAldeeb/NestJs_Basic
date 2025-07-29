import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Error } from './entities/error.entity';
import { Request, Response } from 'express';
import { PaginationWithSearchQueries } from 'src/common/global/dto/global.dto';
import { sendHttpResponse } from 'src/common/services/request.service';
import { Op } from 'sequelize';

@Injectable()
export class ErrorService {
  constructor(
    @InjectModel(Error)
    private ErrorRepository: typeof Error,
  ) {}
  async findAll(
    req: Request,
    res: Response,
    query: PaginationWithSearchQueries,
  ): Promise<any> {
    const { page, q, size } = query;
    let whereCondition = {};
    if (q) {
      whereCondition = {
        [Op.or]: [
          {
            message: { [Op.like]: `%${q}%` },
          },
          {
            url_path: { [Op.like]: `%${q}%` },
          },
          {
            file: { [Op.like]: `%${q}%` },
          },
          {
            status_code: { [Op.eq]: `${q}` },
          },
          {
            id: { [Op.eq]: `${q}` },
          },
        ],
      };
    }

    let { count: total, rows: errors } =
      await this.ErrorRepository.findAndCountAll({
        raw: true,
        limit: +size,
        offset: (+page - 1) * +size,
        where: whereCondition,
      });

    sendHttpResponse(res, HttpStatus.OK, {
      errors,
      total,
      page,
      perPage: +size,
      totalPages: Math.ceil(total / +size),
    });
  }

  remove(id: number) {
    return `This action removes a #${id} error`;
  }
}
