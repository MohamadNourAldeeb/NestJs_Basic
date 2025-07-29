import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationsService {
  constructor(@InjectQueue('notifications') private queue: Queue) {}

  async notify(userId: number, message: string) {
    await this.queue.add(
      'send-notification',
      {
        userId,
        message,
      },
      {
        attempts: 3, // عدد المحاولات
        backoff: 5000, // كل 5 ثواني
      },
    );
  }

  async notifyUsers(users: { id: number }[]) {
    for (const user of users) {
      await this.queue.add(
        'fetch-and-notify',
        { userId: user.id },
        {
          attempts: 3,
          backoff: 5000,
        },
      );
    }
  }
}
