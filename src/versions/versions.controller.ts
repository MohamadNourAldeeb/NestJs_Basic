import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { Request, Response } from 'express';
import { IdDto } from 'src/common/global/dto/global.dto';

@Controller('versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Post()
  addNewAppVersion(
    @Body() createVersionDto: CreateVersionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.versionsService.addNewAppVersion(req, res, createVersionDto);
  }

  @Get()
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.versionsService.findAll(req, res);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Res() res: Response, @Param('id') id: IdDto) {
    return this.versionsService.remove(req, res, id);
  }
}
