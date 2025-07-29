// notifications.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('notifications')
export class NotificationsProcessor {
  @Process('send-notification')
  async handleNotification(job: Job<{ userId: number; message: string }>) {
    const { userId, message } = job.data;

    console.log(`📲 Sending notification to user ${userId}: ${message}`);

    // محاكاة إرسال إشعار
    await new Promise((res) => setTimeout(res, 1000));

    console.log(`✅ Notification sent to user ${userId}`);
  }

  @Process({ name: 'fetch-and-notify', concurrency: 5 }) // بس 5 بنفس الوقت
  async handleUser(job: Job<{ userId: number }>) {
    const { userId } = job.data;

    console.log(`🔄 Fetching data for user ${userId}`);

    try {
      //   const { data } = await axios.get(`https://external.api.com/usage/${userId}`);
      //   const remaining = data.remaining;
      const remaining = 200;
      //   console.log(
      //     `📲 Notify user ${userId}: You have ${remaining} units left.`,
      //   );
      await new Promise((res) => setTimeout(res, 4000));
    } catch (error) {
      console.error(`❌ Error for user ${userId}:`, error.message);
      throw error; // حتى Bull يرجّع المهمة تلقائيًا
    }
  }
}
