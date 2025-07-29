import { Module } from '@nestjs/common';
import { MailService } from './mailer.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    MailService,
  ],
})
export class CustomMailerModule {}
