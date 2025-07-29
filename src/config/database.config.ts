import { SequelizeModuleOptions } from '@nestjs/sequelize';

import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export const databaseConfig: SequelizeModuleOptions = {
  dialect: 'mysql',
  host: process.env.DB_HOST as string | undefined,
  port: +process.env.DB_PORT! as number | undefined,
  username: process.env.DB_USER as string | undefined,
  password: process.env.DB_PASSWORD as string | undefined,
  database: process.env.DB_NAME as string | undefined,
  timezone: '+03:00',
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
  logging: false,
  synchronize: true,
  autoLoadModels: true,
};
