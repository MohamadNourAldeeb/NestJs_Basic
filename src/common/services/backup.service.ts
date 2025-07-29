// backup.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { backup } from '../utilis/database.utils';

@Injectable()
export class BackupService implements OnModuleInit {
  onModuleInit() {
    this.scheduleDailyBackupWithCron();
  }

  scheduleDailyBackupWithCron() {
    cron.schedule('0 1 * * *', async () => {
      console.log(`🔄 Running backup task at ${new Date().toLocaleString()}`);
      try {
        await backup();
        console.log('✅ Backup completed successfully.');
      } catch (error) {
        console.error('❌ Error during backup:', error);
      }
    });
  }
}
