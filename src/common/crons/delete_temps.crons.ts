// backup.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import * as fs from 'fs/promises';
import * as path from 'path';
@Injectable()
export class EmptyTempsService implements OnModuleInit {
  onModuleInit() {
    this.cleanOldFiles();
  }
  private readonly TEMP_DIR = path.join(__dirname, '..', 'uploads', 'temp');

  cleanOldFiles() {
    cron.schedule('0 * * * *', async () => {
      const dirs = await fs.readdir(this.TEMP_DIR);
      const now = Date.now();

      for (const dir of dirs) {
        const dirPath = path.join(this.TEMP_DIR, dir);
        const stats = await fs.stat(dirPath);

        // If folder older than 1 hour — remove
        if (now - stats.mtimeMs > 3600 * 1000) {
          await fs.rm(dirPath, { recursive: true, force: true });
        }
      }
    });
  }
}
