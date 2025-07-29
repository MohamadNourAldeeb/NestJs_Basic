import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  Query,
  ValidationPipe,
  Post,
  Body,
} from '@nestjs/common';
import { BlockService } from './block.service';
import { Request, Response } from 'express';
import {
  IdDto,
  IdParamsDto,
  PaginationWithSearchQueries,
} from 'src/common/global/dto/global.dto';
import { blockListQueryDto, IpBlockListQueryDto } from './dto/block_list.dto';
import {
  DeviceBlockDto,
  EmailBlockDto,
  IpBlockDto,
} from './dto/create-block.dto';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}
  // ___________________________________________________________________________

  @Post('device')
  makeDeviceBlock(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: DeviceBlockDto,
  ) {
    return this.blockService.makeDeviceBlock(req, res, body);
  }
  // ___________________________________________________________________________

  @Post('email')
  makeEmailBlock(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: EmailBlockDto,
  ) {
    return this.blockService.makeEmailBlock(req, res, body);
  }
  // ___________________________________________________________________________
  @Post('ip')
  makeIpBlock(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: IpBlockDto,
  ) {
    return this.blockService.makeIpBlock(req, res, body);
  }
  // ___________________________________________________________________________
  @Get()
  blockList(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: PaginationWithSearchQueries,
  ) {
    return this.blockService.blockList(req, res, query);
  }
  // ___________________________________________________________________________
  @Get('ip')
  IpBlockList(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IpBlockListQueryDto,
  ) {
    return this.blockService.IpBlockList(req, res, query);
  }
}
