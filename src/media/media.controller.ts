import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Res,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  Query,
  Delete,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { multerOptions } from 'src/config/multer.config';
import { File } from 'multer';
import { GetMediaDto } from './dto/get_media.dto';
import { IdParamsDto } from 'src/common/global/dto/global.dto';
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  // _______________________________________________________________________________
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions.public))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50000000 }), // 50MB max size
          new FileTypeValidator({
            fileType:
              /^(image\/(jpeg|png|gif)|video\/(mp4|quicktime)|application\/pdf)$/i,
          }),
        ],
      }),
    )
    file: File,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.mediaService.upload(file, req, res);
  }
  // _______________________________________________________________________________
  @Get()
  findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: GetMediaDto,
  ) {
    return this.mediaService.findAll(req, res, query);
  }
  // _______________________________________________________________________________
  @Delete(':id')
  findOne(
    @Param(new ValidationPipe({ transform: true })) id: IdParamsDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.mediaService.delete(req, res, id);
  }
  // _______________________________________________________________________________

  @Post('chunk')
  @UseInterceptors(FileInterceptor('file', multerOptions.chunkMemoryStorage))
  async uploadChunk(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50000000 }), // 50MB max size
          //   new FileTypeValidator({
          //     fileType:
          //       /^(image\/(jpeg|png|gif)|video\/(mp4|quicktime)|application\/pdf)$/i,
          //   }),
        ],
      }),
    )
    file: File,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body()
    body: {
      fileId: string;
      chunkIndex: number;
      totalChunks: number;
      fileExt: string;
    },
  ) {
    await this.mediaService.uploadChunk(file, body, req, res);
  }

  // _______________________________________________________________________________

  @Get('progress')
  async getProgress(
    @Req() req: Request,
    @Res() res: Response,
    @Query('fileId') fileId: string,
  ) {
    await this.mediaService.getProgress(req, res, fileId);
  }
}
