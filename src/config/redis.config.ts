import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export const CashingOptions = {
  host: process.env.REDIS_HOST as string | undefined,
  port: +process.env.REDIS_PORT! as number | undefined,
  password: process.env.REDIS_PASSWORD as string | undefined,
  db: +process.env.REDIS_DB_NUMBER! as number | undefined,
};
