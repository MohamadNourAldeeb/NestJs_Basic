import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { Request, Response } from 'express';
import { changeLanguageDto, createLanguageDto } from './dto/language.dto';
import { ApiHeader } from '@nestjs/swagger';
import { IdParamsDto } from 'src/common/global/dto/global.dto';

@ApiHeader({
  name: 'device-serial',
  example: 'yes-device',
  description: 'Serial number of the device',
  required: true,
})
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: createLanguageDto,
  ) {
    return this.languagesService.create(req, res, body);
  }
  // _____________________________________________________
  @Get()
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.languagesService.findAll(req, res);
  }
  // _____________________________________________________
  @Get('change/:id')
  change(
    @Req() req: Request,
    @Res() res: Response,
    @Param(new ValidationPipe({ transform: true })) id: IdParamsDto,
  ) {
    return this.languagesService.change(req, res, id);
  }
  // _____________________________________________________

  @Delete(':id')
  remove(
    @Param(new ValidationPipe({ transform: true })) id: IdParamsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.languagesService.remove(req, res, id);
  }
}
