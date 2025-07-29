import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  Res,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Request, Response } from 'express';
import { ApiKeyGuard } from 'src/common/guards/apiKey.guard';
import { ApiConsumes, ApiHeaders, ApiOperation } from '@nestjs/swagger';
import { multerOptions } from 'src/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { deleteProfileDto } from './dto/delete-profile.dto';
import { PaginationQueries } from 'src/common/global/dto/global.dto';

@UseGuards(ApiKeyGuard)
@ApiHeaders([
  {
    name: 'device-serial',
    example: 'sm-50001',
    description: 'Serial number of the device',
    required: true,
  },
  {
    name: 'api-key',
    example: 'NESTJS',
    description: 'Api key for app',
    required: true,
  },
])
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'get my profile information',
  })
  @Get()
  getMyProfile(@Req() req: Request, @Res() res: Response) {
    return this.profileService.getMyProfile(req, res);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'upload new profile picture',
  })
  @ApiConsumes('multipart/form-data')
  @Post('picture')
  @UseInterceptors(FileInterceptor('file', multerOptions.profile))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }), // 10MB max size
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|gif|jpg)$/i,
          }),
        ],
      }),
    )
    file: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.profileService.uploadPicture(file, req, res);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'delete the profile picture',
  })
  @Delete('picture')
  @ApiOperation({ summary: 'Delete the picture of user' })
  removeImage(@Req() req: Request, @Res() res: Response) {
    return this.profileService.removePicture(req, res);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'update the profile information',
  })
  @Put()
  update(
    @Req() req: Request,
    @Res() res: Response,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.update(req, res, updateProfileDto);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'delete the account',
  })
  @Post('delete-account')
  deleteProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() deleteProfileDto: deleteProfileDto,
  ) {
    return this.profileService.deleteProfile(req, res, deleteProfileDto);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'get my profile viewers',
  })
  @Get('viewers')
  getMyProfileViewers(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: PaginationQueries,
  ) {
    return this.profileService.getMyProfileViewers(req, res, query);
  }
}
