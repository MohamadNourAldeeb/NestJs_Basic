import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Media } from './entities/media.entity';
import { sendHttpResponse } from 'src/common/services/request.service';
import { Request, Response } from 'express';
import { UuidService } from 'src/common/services/uuid.service';
import { enumTypeOfMedia } from 'src/common/enums/enums';
import { CustomException } from 'src/common/constant/custom-error';
import { File } from 'multer';
import { GetMediaDto } from './dto/get_media.dto';
import { Op } from 'sequelize';
import { IdParamsDto } from 'src/common/global/dto/global.dto';
import { ImageProcessingService } from 'src/common/services/image_processing.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fss from 'fs';
import { pipeline } from 'stream/promises';
import { RedisService } from 'src/common/services/redis.service';
@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media)
    private mediaRepository: typeof Media,
    private readonly UuidServiceFunction: UuidService,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly redisService: RedisService,
  ) {}

  private readonly TEMP_DIR = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    'temp',
  );
  private readonly FINAL_DIR = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    'final',
  );

  // __________________________________________________________________
  /**
   *
   * @param file
   * @param req
   * @param res
   */
  async upload(file: File, req: Request, res: Response) {
    const mimeType = file.mimetype;
    const mediaType = mimeType.startsWith('image')
      ? enumTypeOfMedia.IMAGE
      : mimeType.startsWith('video')
        ? enumTypeOfMedia.VIDEOS
        : enumTypeOfMedia.FILES;

    const createdBody: any = {
      _id: this.UuidServiceFunction.generateUuid(),
      file_name: file.filename,
      base_name: file.originalname,
      type: mediaType,
    };

    const media: Media = await this.mediaRepository.create(createdBody);

    sendHttpResponse(res, HttpStatus.OK, {
      message: 'operation accomplished successfully',
      _id: media._id,
      base_name: file.originalname,
      file_name: file.filename,
      type: mediaType,
    });
  }
  // __________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param query
   */
  async findAll(req: Request, res: Response, query: GetMediaDto) {
    const { page, q, size, app_type } = query;
    let whereCondition: any = {};
    if (app_type) {
      if (app_type === enumTypeOfMedia.IMAGE) {
        whereCondition.type = enumTypeOfMedia.IMAGE;
      } else if (app_type === enumTypeOfMedia.VIDEOS) {
        whereCondition.type = enumTypeOfMedia.VIDEOS;
      } else {
        whereCondition.type = enumTypeOfMedia.FILES;
      }
    }

    if (q) {
      whereCondition[Op.or] = [
        {
          base_name: { [Op.like]: `%${q}%` },
        },
        {
          _id: { [Op.eq]: `${q}` },
        },
      ];
    }

    let { rows: files, count: total } =
      await this.mediaRepository.findAndCountAll({
        raw: true,
        limit: +size,
        offset: (+page - 1) * +size,
        attributes: { exclude: ['id', 'updatedAt'] },
        where: whereCondition,
        order: [['createdAt', 'DESC']],
      });

    sendHttpResponse(res, HttpStatus.OK, {
      files,
      total,
      page,
      perPage: +size,
      totalPages: Math.ceil(total / +size),
    });
  }
  // _______________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param query
   */
  async delete(req: Request, res: Response, param: IdParamsDto) {
    let media: Media = await this.mediaRepository.findOne({
      raw: true,
      attributes: ['id', 'file_name', 'type'],
      where: { _id: param.id },
    });
    if (!media) throw new CustomException('Media Not Found !');

    let filePath = '/uploads/media/images/';

    if (media.type === enumTypeOfMedia.VIDEOS) {
      filePath = '/uploads/media/videos/';
    } else if (media.type === enumTypeOfMedia.FILES) {
      filePath = '/uploads/media/files/';
    }
    await this.imageProcessingService.deleteFile(
      path.join(path.resolve() + filePath + media.file_name),
    );
    await this.mediaRepository.destroy({ where: { id: media.id } });

    sendHttpResponse(res, HttpStatus.OK);
  }
  // _______________________________________________________________________________
  /**
   *
   * @param file
   * @param body
   * @param req
   * @param res
   */
  async uploadChunk(
    file: File,
    body: {
      fileId: string;
      chunkIndex: number;
      totalChunks: number;
      fileExt: string;
    },
    req: Request,
    res: Response,
  ) {
    const { fileId, chunkIndex, totalChunks, fileExt } = body;

    if (+chunkIndex > +totalChunks)
      throw new CustomException(
        'you cant send chunks grater than total length',
      );

    const uploadDir = path.join(this.TEMP_DIR, fileId);
    try {
      await fs.mkdir(uploadDir, { recursive: true });

      const chunkPath = path.join(uploadDir, `chunk_${chunkIndex}`);

      if (fss.existsSync(chunkPath)) {
        throw new CustomException('this chunk already upload ');
      }

      await fs.writeFile(chunkPath, file.buffer);

      await this.redisService.addToRedisCache(
        `${fileId}:${chunkIndex}`,
        'received',
        3600,
      );

      const keys = await this.redisService.getKeysFromRedisCache(`${fileId}:*`);
      const uploadedChunks = keys.map((key) => +key.replace(`${fileId}:`, ''));
      uploadedChunks.sort((a, b) => a - b);

      let message = 'Chunk received';
      let file_link = null;

      if (+uploadedChunks.length === +totalChunks) {
        let finalPath = path.join(this.FINAL_DIR, `${fileId}.${fileExt}`);
        await fs.mkdir(path.dirname(finalPath), { recursive: true });

        const writeStream = fss.createWriteStream(finalPath);

        for (let i = 0; i < +totalChunks; i++) {
          const chunkPath = path.join(uploadDir, `chunk_${i + 1}`);
          if (fss.existsSync(chunkPath)) {
            const data = fss.readFileSync(chunkPath);
            writeStream.write(data);
          }
        }

        writeStream.end();

        await this.redisService.deleteFromRedis(`${fileId}:*`);
        await fs.rm(uploadDir, { recursive: true, force: true });
        file_link =
          process.env.LINK + '/uploads/final/' + `${fileId}.${fileExt}`;
        message = 'Upload complete';
      }
      const progress = (+uploadedChunks.length / +totalChunks) * 100;

      sendHttpResponse(res, HttpStatus.OK, {
        message,
        progress: `${progress.toFixed(2)} %`,
        file_link,
      });
    } catch (error) {
      await this.redisService.deleteFromRedis(`${fileId}:*`);
      try {
        // await fs.rm(uploadDir, { recursive: true, force: true });
      } catch {}
      throw new CustomException(`Error during upload ,${error}`);
    }
  }
  // _______________________________________________________________________________
  /**
   *
   * @param req
   * @param res
   * @param query
   */
  async getProgress(req: Request, res: Response, fileId: any) {
    const keys = await this.redisService.getKeysFromRedisCache(`${fileId}:*`);

    const uploadedChunks = keys.map((key) => parseInt(key.split(':')[1], 10));
    uploadedChunks.sort((a, b) => a - b);

    sendHttpResponse(res, HttpStatus.OK, { uploadedChunks });
  }
}
