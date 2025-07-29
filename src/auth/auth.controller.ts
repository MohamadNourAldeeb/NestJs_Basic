import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from 'src/common/guards/apiKey.guard';
import { Request, Response } from 'express';
import { VerificationDto } from './dto/verification.dto';
import { sendCodeDto } from './dto/send_code.dto';
import { signInDto, SignInWithGoogleDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { changePassDto } from './dto/change-password.dto';
import { ApiBearerAuth, ApiHeaders, ApiOperation } from '@nestjs/swagger';
import { IdDto } from 'src/common/global/dto/global.dto';
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
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'sign in with normal way',
  })
  @Post('sign-in')
  signIn(
    @Body() signInDto: signInDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.signIn(req, res, signInDto);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'api for send otp code to email',
  })
  @Post('send-code')
  sendCode(
    @Body() body: sendCodeDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.sendCode(req, res, body);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'api to make verification to your email by otp',
  })
  @Post('verification')
  verification(
    @Body() body: VerificationDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.verification(req, res, body);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'sign out of tour account',
  })
  @Get('sign-out')
  signOut(@Req() req: Request, @Res() res: Response) {
    return this.authService.signOut(req, res);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'api for get new token from refresh token',
  })
  @Post('refresh-token')
  refreshToken(
    @Body() body: RefreshTokenDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.refreshToken(req, res, body);
  }
  // _______________________________________________________________________________________
  @ApiOperation({
    summary: 'api for change old password if you know it',
  })
  @Post('change-pass')
  changePassword(
    @Body() body: changePassDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.changePass(req, res, body);
  }
  // _________________________________________________________________
  @ApiOperation({
    summary: 'sign in with google',
  })
  @Post('sign-in-google')
  async google(
    @Body() SignInBody: SignInWithGoogleDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.authService.SignInWithGoogle(req, res, SignInBody);
  }

  // _________________________________________________________________
  @ApiOperation({
    summary: 'api for get the account logs',
  })
  @Get('logs')
  logs(@Req() req: Request, @Res() res: Response) {
    return this.authService.logs(req, res);
  }
  // _________________________________________________________________
  @ApiOperation({
    summary: 'api for make kick out of the account from specific device',
  })
  @Post('kick-out')
  kickOut(@Req() req: Request, @Res() res: Response, @Body() body: IdDto) {
    return this.authService.kickOut(req, res, body);
  }
}
