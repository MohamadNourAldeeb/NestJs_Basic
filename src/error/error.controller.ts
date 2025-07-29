import {
  Controller,
  Get,
  Param,
  Delete,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import { ErrorService } from './error.service';
import { Request, Response } from 'express';
import { PaginationWithSearchQueries } from 'src/common/global/dto/global.dto';

@Controller('error')
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  @Get()
  findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: PaginationWithSearchQueries,
  ) {
    return this.errorService.findAll(req, res, query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.errorService.remove(+id);
  }
}
