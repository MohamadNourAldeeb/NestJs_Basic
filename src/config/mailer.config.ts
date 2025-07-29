import { error } from 'console';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
export const MailerOptions = {
  service: process.env.EMAIL_SERVICE,
  secure: true,
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: false,
  priority: 'high',
  logger: false,
};
