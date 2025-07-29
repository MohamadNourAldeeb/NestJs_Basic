import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { CustomException } from 'src/common/constant/custom-error';
import { sendHttpResponse } from 'src/common/services/request.service';
import { sendForAllAgentsDto } from './dto/send_not.dto';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FirebaseService {
  constructor(
    @InjectModel(UserDevice)
    private UserDeviceRepository: typeof UserDevice,
    @InjectModel(User)
    private UserRepository: typeof User,
  ) {}

  static async sendNotification(
    token: string,
    title: string,
    body: string,
  ): Promise<any> {
    const message = {
      data: {
        title,
        body,
      },
      token,
      // Android configuration
      android: {
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          icon: process.env.LINK + '/uploads/jena-logo.png',
        },
      },
      // iOS configuration
      apns: {
        payload: {
          aps: {
            sound: 'default',
            alert: {
              title,
              body,
            },
          },
        },
        headers: {
          'apns-push-type': 'alert',
          'apns-priority': '10', // High priority
        },
      },
    };
    try {
      await admin.messaging().send(message);
      // console.log('Notification sent successfully');
      let returnMessage = `'Notification sent successfully'`;
      return returnMessage;
    } catch (error) {
      if (error.code === 'messaging/invalid-registration-token') {
        // console.log('Invalid token:', token);
      } else {
        console.log('Error sending notification:', error);
      }
    }
  }
  static async sendMultiNotification(
    tokens: string[],
    title: string,
    body: string,
  ): Promise<any> {
    const uniqueTokens = Array.from(new Set(tokens));
    const message = {
      data: {
        title,
        body,
      },
      tokens: uniqueTokens,
      // Android configuration
      // android: {
      //   notification: {
      //     sound: 'default',
      //     clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      //     icon: process.env.LINK + 'uploads/jena-logo.png',
      //   },
      // },
      // iOS configuration
      apns: {
        payload: {
          aps: {
            sound: 'default',
            alert: {
              title,
              body,
            },
          },
        },
        headers: {
          'apns-push-type': 'alert',
          'apns-priority': '10', // High priority
        },
      },
    };
    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      let returnMessage = `${response.successCount} notifications were sent successfully.`;

      if (response.failureCount > 0) {
        // console.log(`Failed to send ${response.failureCount} notifications.`);
        response.responses.forEach((result, index) => {
          if (!result.success) {
            // console.log(
            //   `Error sending notification to token ${uniqueTokens[index]}:`,
            //   result.error?.message,
            // );
          }
        });
      }
      return returnMessage;
    } catch (error) {
      throw new CustomException(
        `Failed to send multicast notification ${error.message}`,
      );
    }
  }
  async send(req: Request, res: Response, body: any): Promise<void> {
    const message = {
      data: {
        title: body.title,
        body: body.body,
      },
      token: body.token,
    };
    try {
      await admin.messaging().send(message);
      sendHttpResponse(res, HttpStatus.OK);
      console.log('Notification sent successfully');
    } catch (error) {
      if (error.code === 'messaging/invalid-registration-token') {
        throw new CustomException(`Invalid token: ${body.token}`);
      } else {
        throw new CustomException(`Error sending notification:: ${error}`);
      }
    }
  }
  async sendForAllAgents(
    req: Request,
    res: Response,
    body: sendForAllAgentsDto,
  ): Promise<void> {
    try {
      let whereCondition: any = { role_id: 2 };
      if (req.user.role_id == 3)
        whereCondition = { role_id: 2, supervisor_id: req.user.id };

      let fcmTokens: any[] = await this.UserDeviceRepository.findAll({
        raw: true,
        attributes: ['fcm_token'],
        nest: true,
        include: [
          {
            model: this.UserRepository,
            required: true,
            attributes: [],
            where: whereCondition,
          },
        ],
      });
      fcmTokens = fcmTokens.map((token: any) => token.fcm_token);
      fcmTokens = await FirebaseService.sendMultiNotification(
        fcmTokens,
        body.title,
        body.body,
      );
      sendHttpResponse(res, HttpStatus.OK);
      // console.log('Notification sent successfully');
    } catch (error) {
      throw new CustomException(`Error sending notification:: ${error}`);
    }
  }
}
