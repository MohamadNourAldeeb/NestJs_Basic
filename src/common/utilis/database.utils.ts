import { Sequelize } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import { exec, spawn } from 'child_process';
import { join } from 'path';
import * as path from 'path';
import * as moment from 'moment';
import { databaseConfig } from 'src/config/database.config';
import { promisify } from 'util';
import { mkdirSync } from 'fs';
export async function initializeDatabase(configService: ConfigService) {
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    // timezone: '+03:00',
    // dialectOptions: {
    //   dateStrings: true,
    //   typeCast: true,
    // },
    logging: false,
  });
  try {
    if (process.env.RUN_DB_LOCAL == 'true') {
      const mysqlPath = join(path.resolve(), 'mysql', 'bin', 'mysqld');
      await new Promise((resolve, reject) => {
        const mysqlProcess: any = exec(
          `${mysqlPath} --defaults-file=./mysql/my.ini --console`,
        );

        mysqlProcess.stdout.on('data', (data) => {
          console.log(`MySQL: ${data}`);
        });

        mysqlProcess.stderr.on('data', (data) => {
          if (
            data.includes('ready for connections') ||
            data.includes('Server startup complete')
          ) {
            console.log('MySQL server is ready.');
            resolve(mysqlProcess); // Resolve the promise when MySQL is ready
          }
          // console.error(`MySQL Error: ${data}`);
        });

        mysqlProcess.on('close', (code) => {
          console.log(`MySQL process exited with code ${code}`);
          if (code === 0) {
            resolve(code);
          } else {
            reject(new Error(`MySQL process exited with code ${code}`));
            process.exit(1);
          }
        });
      });
    }
    // Test the connection to the database
    await sequelize.authenticate();
    console.log(
      '\x1b[32m%s\x1b[0m',
      ` ✔ Database : ${configService.get<string>('DB_NAME')} connection established successfully.`,
    );
  } catch (error) {
    if (error.message.includes('Unknown database')) {
      // If the database doesn't exist, create it
      const databaseName = configService.get<string>('DB_NAME');

      const sequelizeWithoutDb = new Sequelize({
        dialect: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        timezone: '+03:00',
        dialectOptions: {
          dateStrings: true,
          typeCast: true,
        },
        logging: false,
      });

      await sequelizeWithoutDb.query(`CREATE DATABASE ${databaseName};`);
      console.log(`Database "${databaseName}" created successfully.`);

      console.log(
        '\x1b[32m%s\x1b[0m',
        ` ✔ Database "${databaseName}" created successfully.`,
      );
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}
export function startMySQL() {
  return new Promise((resolve, reject) => {
    const mysqlPath = join(__dirname, '../../../', 'mysql', 'bin', 'mysqld');
    const mysqlProcess: any = exec(
      `${mysqlPath} --defaults-file=./mysql/my.ini --console`,
    );

    mysqlProcess.stderr.on('data', (data) => {
      if (
        data.includes('ready for connections') ||
        data.includes('Server startup complete')
      ) {
        console.log('MySQL server is ready.');
        resolve(mysqlProcess);
      }
      // Reject the promise if there's an error
      reject(new Error(data));
    });

    mysqlProcess.on('close', (code) => {
      console.log(`MySQL process exited with code ${code}`);
      if (code !== 0) {
        reject(new Error(`MySQL process exited with code ${code}`));
      }
    });
    console.log('Starting MySQL server...');
  });
}
export function stopMySQL() {
  return new Promise((resolve, reject) => {
    const mysqlAdminPath = join(__dirname, '../', 'mysql', 'bin', 'mysqladmin');
    const args = ['-u', 'root', '-p', '--socket=/tmp/mysql.sock', 'shutdown'];

    exec(`${mysqlAdminPath} ${args.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Failed to stop MySQL: ${stderr || error}`);
      } else {
        resolve('MySQL stopped successfully');
      }
    });
  });
}
const execPromise = promisify(exec);
export async function backup() {
  const date = moment();
  const sequelize = new Sequelize(databaseConfig);

  const currentDate = `${date.year()}.${
    date.month() + 1
  }.${date.date()}.${date.hour()}.${date.minute()}`;
  let filename = `database-backup-${currentDate}.sql`;
  const backupDir = './backups';
  const backupFilename = `${backupDir}/${filename}`;
  mkdirSync(backupDir, { recursive: true });
  try {
    await sequelize.authenticate();

    let mysqlPath = join(__dirname, '../../../', 'mysql', 'bin', 'mysqldump');
    if (process.env.NODE_ENV == 'production') {
      mysqlPath = '/usr/bin/mysqldump';
    }
    let command = `${mysqlPath} -u ${process.env.DB_USER}  ${process.env.DB_NAME} > ${backupFilename}`;
    if (process.env.NODE_ENV == 'development')
      command = `C:\\xampp\\mysql\\bin\\mysqldump.exe -u ${process.env.DB_USER}  ${process.env.DB_NAME} > ${backupFilename}`;

    await execPromise(command);
    console.log(`Backup created successfully: ${backupFilename} ✅`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT. Shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
  });
}
