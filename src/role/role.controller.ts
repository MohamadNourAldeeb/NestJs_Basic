import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  Put,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Request, Response } from 'express';
import { IdDto } from 'src/common/global/dto/global.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(
    @Body() createRoleDto: CreateRoleDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.roleService.create(createRoleDto, req, res);
  }

  @Get()
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.roleService.findAll(req, res);
  }

  @Put(':_id')
  update(
    @Param('_id') _id: IdDto,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.roleService.update(_id, updateRoleDto, req, res);
  }

  @Delete(':_id')
  remove(@Param('_id') _id: IdDto, @Req() req: Request, @Res() res: Response) {
    return this.roleService.remove(_id, req, res);
  }
}
