import { HttpStatus, Injectable } from '@nestjs/common';

import { sendHttpResponse } from 'src/common/services/request.service';
import { Language } from './entities/language.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Request, Response } from 'express';
import { changeLanguageDto, createLanguageDto } from './dto/language.dto';
import { CustomException } from 'src/common/constant/custom-error';
import { User } from 'src/user/entities/user.entity';
import { IdParamsDto } from 'src/common/global/dto/global.dto';
import { UuidService } from 'src/common/services/uuid.service';
import { Op } from 'sequelize';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectModel(Language)
    private LanguageRepository: typeof Language,
    @InjectModel(User)
    private UserRepository: typeof Language,
    private readonly UuidServiceFunction: UuidService,
  ) {}
  // _______________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   */
  async findAll(req: Request, res: Response) {
    let languages: Language[] = await this.LanguageRepository.findAll({
      raw: true,
      attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
    });

    sendHttpResponse(res, HttpStatus.OK, { languages });
  }
  // _______________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param query
   */
  async change(req: Request, res: Response, param: IdParamsDto) {
    let language: Language = await this.LanguageRepository.findOne({
      raw: true,
      attributes: ['id'],
      where: { _id: param.id },
    });
    if (!language) throw new CustomException('Language Not Found !');

    await this.UserRepository.update(
      {
        language_id: language.id,
      },
      { where: { id: req.user.id } },
    );

    sendHttpResponse(res, HttpStatus.OK);
  }
  // _______________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param body
   */
  async create(req: Request, res: Response, body: createLanguageDto) {
    if (
      await this.LanguageRepository.findOne({
        raw: true,
        attributes: ['id'],
        where: { [Op.or]: [{ lang_code: body.code }, { name: body.name }] },
      })
    )
      throw new CustomException('this language already exist');

    let language: Language = await this.LanguageRepository.create({
      _id: this.UuidServiceFunction.generateUuid(),
      name: body.name,
      lang_code: body.code,
    });

    sendHttpResponse(res, HttpStatus.OK, {
      _id: language._id,
      name: language.name,
      lang_code: language.lang_code,
    });
  }
  // _______________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param query
   */
  async remove(req: Request, res: Response, param: IdParamsDto) {
    let language: Language = await this.LanguageRepository.findOne({
      raw: true,
      attributes: ['id'],
      where: { _id: param.id },
    });
    if (!language) throw new CustomException('Language Not Found !');

    await this.LanguageRepository.destroy({ where: { id: language.id } });

    sendHttpResponse(res, HttpStatus.OK);
  }
}
