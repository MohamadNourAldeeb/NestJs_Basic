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
    UseGuards,
} from '@nestjs/common'
import { PermissionService } from './permission.service'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { Request, Response } from 'express'
import { ApiKeyGuard } from 'src/common/guards/apiKey.guard'
@UseGuards(ApiKeyGuard)
@Controller('permission')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Post()
    create(
        @Body() createPermissionDto: CreatePermissionDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        return this.permissionService.create(createPermissionDto, req, res)
    }

    @Get()
    findAll(@Req() req: Request, @Res() res: Response) {
        return this.permissionService.findAll(req, res)
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updatePermissionDto: UpdatePermissionDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        return this.permissionService.update(+id, updatePermissionDto, req, res)
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.permissionService.remove(+id, req, res)
    }
}
