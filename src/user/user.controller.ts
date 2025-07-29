import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Res,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { permissions } from 'src/common/constant/permissions';
import { ApiKeyGuard } from 'src/common/guards/apiKey.guard';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { AdminRolesGuard } from 'src/common/guards/admin_role.guard';
import { ApiOperation } from '@nestjs/swagger';
import { GetAllActivityLogDto } from './dto/get-all-activity_log.dto';
@UseGuards(ApiKeyGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // _______________________________________________________________________

  @UseGuards(AdminRolesGuard)
  @ApiOperation({
    summary: 'api for create new user from admin',
  })
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.userService.create(req, res, createUserDto);
  }
  // _______________________________________________________________________

  @UseGuards(AdminRolesGuard)
  @ApiOperation({
    summary: 'api for get all users to admin',
  })
  @Get()
  findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetAllUserDto,
  ) {
    return this.userService.findAll(req, res, query);
  }
  // _______________________________________________________________________

  // // @Permissions([permissions.user.getAll.value])

  @Get('activity-log')
  findAllActivityLog(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetAllActivityLogDto,
  ) {
    return this.userService.findAllActivityLog(req, res, query);
  }
  // _______________________________________________________________________
  @UseGuards(AdminRolesGuard)
  @ApiOperation({
    summary: 'api for update user from admin',
  })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.userService.update(id, req, res, updateUserDto);
  }
  // _______________________________________________________________________
  @UseGuards(AdminRolesGuard)
  @ApiOperation({
    summary: 'api for remove user from admin',
  })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.userService.remove(id, req, res);
  }
}
