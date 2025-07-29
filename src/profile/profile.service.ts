import { HttpStatus, Injectable } from '@nestjs/common';
import { deleteProfileDto } from './dto/delete-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Request, Response } from 'express';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/entities/user.entity';
import { Language } from 'src/languages/entities/language.entity';
import { sendHttpResponse } from 'src/common/services/request.service';
import { CustomException } from 'src/common/constant/custom-error';
import { ImageProcessingService } from 'src/common/services/image_processing.service';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { Sequelize } from 'sequelize-typescript';
import { Op, Transaction } from 'sequelize';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { RedisService } from 'src/common/services/redis.service';
import { enumStateOfEmail } from 'src/common/enums/enums';
import { ProfileViewer } from './entities/profile.entity';
import { PaginationQueries } from 'src/common/global/dto/global.dto';
@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User)
    private UserRepository: typeof User,
    @InjectModel(UserRefreshToken)
    private UserRefreshTokenRepository: typeof UserRefreshToken,
    @InjectModel(ProfileViewer)
    private ProfileViewerRepository: typeof ProfileViewer,
    @InjectModel(Language)
    private LanguageRepository: typeof Language,
    private readonly imageProcessingService: ImageProcessingService,
    @InjectConnection() private sequelizeConnection: Sequelize,
    private readonly redisService: RedisService,
  ) {}
  // ___________________________________________________________________
  /**
   *
   * @param req
   * @param res
   */
  async getMyProfile(req: Request, res: Response): Promise<any> {
    const user: User = await this.UserRepository.findOne({
      raw: true,
      nest: true,
      attributes: {
        exclude: [
          'id',
          'password',
          'google_id',
          'role_id',
          'language_id',
          'updatedAt',
        ],
      },
      include: [
        {
          model: this.LanguageRepository,
          required: true,
          attributes: ['name', 'lang_code'],
        },
      ],
      where: { id: req.user.id },
    });
    let user_pictures = { original_picture: null, compressed_picture: null };
    if (user.picture) {
      user_pictures.original_picture =
        process.env.LINK + '/uploads/profiles/' + user.picture;
      user_pictures.compressed_picture =
        process.env.LINK +
        '/uploads/profiles/' +
        `${user.picture.replace(/\.\w+$/, '')}.webp`;
    }

    delete user.picture;
    sendHttpResponse(res, HttpStatus.OK, {
      ...user,
      user_pictures,
    });
  }
  // ___________________________________________________________________
  /**
   *
   * @param file
   * @param req
   * @param res
   */
  async uploadPicture(file: any, req: Request, res: Response) {
    const user: User = await this.UserRepository.findOne({
      raw: true,
      attributes: ['id'],
      where: { id: req.user.id },
    });
    if (!user)
      throw new CustomException('user Not Found ! , something went error ');

    const webpPath = await this.imageProcessingService.compressToWebP(
      file.path,
      file.filename.replace(/\.\w+$/, ''),
      25,
    );

    await this.UserRepository.update(
      { picture: file.filename },
      { where: { id: user.id } },
    );

    sendHttpResponse(res, HttpStatus.OK, {
      message: 'operation accomplished successfully',
      base_name: file.base_name,
      original_link: process.env.LINK + '/uploads/profiles/' + file.filename,
      compressed_link: process.env.LINK + '/uploads/profiles/' + webpPath,
    });
  }

  // ___________________________________________________________________
  /**
   *
   * @param req
   * @param res
   */
  async removePicture(req: Request, res: Response): Promise<any> {
    const user: User = await this.UserRepository.findOne({
      raw: true,
      attributes: ['id', 'picture'],
      where: { id: req.user.id },
    });
    if (!user)
      throw new CustomException('user Not Found ! , something went error ');

    await this.imageProcessingService.deleteFile(
      path.join(path.resolve() + '/uploads/profiles/' + user.picture),
    );

    await this.UserRepository.update(
      { picture: null },
      { where: { id: req.user.id } },
    );

    sendHttpResponse(res, HttpStatus.OK);
  }
  // ___________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param updateProfileDto
   */
  async update(
    req: Request,
    res: Response,
    updateProfileDto: UpdateProfileDto,
  ) {
    const { email, phone_number, user_name } = updateProfileDto;

    if (
      phone_number &&
      (await this.UserRepository.findOne({
        attributes: ['id'],
        where: { phone_number, id: { [Op.not]: req.user.id } },
      }))
    )
      throw new CustomException('The Phone number already Used !');

    if (
      await this.UserRepository.findOne({
        attributes: ['id'],
        where: { email, id: { [Op.not]: req.user.id } },
      })
    )
      throw new CustomException('The Email already Used !');

    if (
      await this.UserRepository.findOne({
        attributes: ['id'],
        where: { user_name, id: { [Op.not]: req.user.id } },
      })
    )
      throw new CustomException('The User name already Used !');

    let user: User = await this.UserRepository.findOne({
      attributes: ['id', 'email'],
      where: { id: req.user.id },
    });

    let updatedBody: any = { ...updateProfileDto };
    let responseMessage: string | null = null;

    await this.sequelizeConnection.transaction(
      async (transaction: Transaction) => {
        if (user.email.trim() != email) {
          await this.UserRefreshTokenRepository.destroy({
            where: { user_id: user.id },
            transaction,
          });
          updatedBody.email_state = enumStateOfEmail.UNVERIFIED;
          responseMessage = `Please login again my friend`;
        }

        await this.UserRepository.update(updatedBody, {
          where: { id: user.id },
          transaction,
        });
      },
    );

    if (user.email.trim() != email) {
      let userRefreshTokens: UserRefreshToken[] =
        await this.UserRefreshTokenRepository.findAll({
          attributes: ['id'],
          where: { user_id: user.id },
        });
      let tokenIds: number[] = userRefreshTokens.map(
        (token: UserRefreshToken) => {
          return token.id;
        },
      );
      await Promise.all(
        tokenIds.map(async (tokenId: number) => {
          await this.redisService.deleteFromRedis(`${tokenId}`);
        }),
      );
    }

    if (!responseMessage) sendHttpResponse(res, HttpStatus.OK);
    else sendHttpResponse(res, HttpStatus.OK, { message: responseMessage });
  }
  // ___________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param Body
   */
  async deleteProfile(
    req: Request,
    res: Response,
    Body: deleteProfileDto,
  ): Promise<any> {
    const user: User = await this.UserRepository.findOne({
      raw: true,
      attributes: ['id', 'password'],
      where: { id: req.user.id },
    });
    if (!user)
      throw new CustomException('user Not Found ! , something went error .');

    let check_pass = await bcrypt.compare(Body.password, user.password);
    if (!check_pass) {
      throw new CustomException('The entered password is incorrect ❌');
    }

    let userRefreshTokens: UserRefreshToken[] =
      await this.UserRefreshTokenRepository.findAll({
        attributes: ['id'],
        where: { user_id: user.id },
      });
    let tokenIds: number[] = userRefreshTokens.map(
      (token: UserRefreshToken) => {
        return token.id;
      },
    );
    await this.sequelizeConnection.transaction(
      async (transaction: Transaction) => {
        await this.UserRepository.destroy({
          where: { id: user.id },
          transaction,
        });
        await this.UserRefreshTokenRepository.destroy({
          where: { user_id: user.id },
          transaction,
        });
      },
    );

    await Promise.all(
      tokenIds.map(async (tokenId: number) => {
        await this.redisService.deleteFromRedis(`${tokenId}`);
      }),
    );
    sendHttpResponse(res, HttpStatus.OK);
  }
  // ___________________________________________________________________
  /**
   *
   * @param req
   * @param res
   */
  async getMyProfileViewers(
    req: Request,
    res: Response,
    query: PaginationQueries,
  ): Promise<any> {
    const { page, size } = query;

    const { count: total, rows: viewers } =
      await this.ProfileViewerRepository.findAndCountAll({
        raw: true,
        nest: true,
        limit: +size,
        offset: (+page - 1) * +size,
        attributes: [['createdAt', 'view_at']],
        include: [
          {
            model: this.UserRepository,
            required: true,
            as: 'Viewer',
            attributes: {
              exclude: [
                'id',
                'password',
                'google_id',
                'role_id',
                'language_id',
                'updatedAt',
                'picture',
              ],
              include: [
                [
                  Sequelize.literal(`
                CASE 
                  WHEN \`Viewer\`.\`picture\` IS NOT NULL THEN CONCAT('${process.env.LINK}/uploads/profiles/', \`Viewer\`.\`picture\`)
                  ELSE NULL
                END
              `),
                  'original_picture',
                ],
                [
                  Sequelize.literal(`
               CASE 
      WHEN \`Viewer\`.\`picture\` IS NOT NULL THEN CONCAT(
        '${process.env.LINK}/uploads/profiles/',
        SUBSTRING_INDEX(\`Viewer\`.\`picture\`, '.', 1),
        '.webp'
      )
      ELSE NULL
    END
              `),
                  'compressed_picture',
                ],
              ],
            },
          },
        ],
        where: { user_id: req.user.id },
      });

    sendHttpResponse(res, HttpStatus.OK, {
      viewers,
      total,
      page,
      perPage: +size,
      totalPages: Math.ceil(total / +size),
    });
  }
}
