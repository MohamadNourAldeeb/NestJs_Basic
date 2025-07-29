import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Inject } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import handlebars from 'handlebars';
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  getEmailTemplate = (templateName: string, data: object) => {
    const templatePath = path.join(
      path.join(path.resolve(), 'src/common/resources/emails'),
      `${templateName}.hbs`,
    );
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const htmlToSend = template({ ...data, date: new Date() });
    return htmlToSend;
  };

  async sendMail(
    templateName: string,
    to: string,
    subject: string,
    data: object,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: `${process.env.APP_NAME} <${process.env.EMAIL_USERNAME}>`,
        to,
        subject,
        html: this.getEmailTemplate(templateName, data),
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
