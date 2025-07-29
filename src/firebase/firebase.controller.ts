import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { Request, Response } from 'express';
import { sendForAllAgentsDto } from './dto/send_not.dto';
import { DashboardRolesGuard } from 'src/common/guards/dashboard_role.guard';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  create(@Req() req: Request, @Res() res: Response, @Body() Body: any) {
    return this.firebaseService.send(req, res, Body);
  }
  // @UseGuards(DashboardRolesGuard)
  // @Post('/users')
  // allAgents(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   @Body() Body: sendForAllAgentsDto,
  // ) {
  //   return this.firebaseService.sendForAllAgents(req, res, Body);
  // }
}
