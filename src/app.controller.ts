import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { NotificationsService } from './common/services/notifications.service';
import { Request, Response } from 'express';
import * as ipCountry from 'ip-country';
import { getCountryFromIP } from './common/utilis/helper';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  getHello(): any {
    // عدد مرات تكرار العناصر
    function countOccurrences(arr) {
      return arr.reduce((acc, val) => {
        console.log(acc);
        acc[val] = acc[val] ? acc[val] + 1 : 1;
        return acc;
      }, {});
    }
    // return countOccurrences([1, 1, 5, 3, 4, 5]);

    // function setArray(arr: any[]) {
    //   // const seen = Array.from(new Set(arr));
    //   let seen = new Set();
    //   let result: any[] = [];

    //   for (const item of arr) {
    //     console.log(seen);
    //     if (!seen.has(item.id)) {
    //       seen.add(item.id);
    //       result.push(item);
    //     }
    //   }
    //   return result;
    // }

    // return setArray([
    //   { id: 1, name: 'ahmad' },
    //   { id: 2, name: 'noor' },
    //   { id: 1, name: 'mohamad' },
    //   { id: 3, name: 'deeb' },
    //   { id: 2, name: 'khaled' },
    // ]);

    //   function reverseWords(sentence: string) {
    //     return sentence.split(' ').reverse().join(' ');
    //   }
    //   return reverseWords('hello world from node');
    // }

    // function count(sentence: string) {
    //   let result: any = {};

    //   for (const char of sentence.toLocaleLowerCase()) {
    //     result[char] = result[char] ? result[char] + 1 : 1;
    //   }

    //   return result;
    // }
    // return count('hello world from node');

    // function included(arr1: any[], arr2: any[]) {
    //   const set1 = new Set(arr1);
    //   return arr2.filter((item) => set1.has(item));
    // }

    // return included([1, 2, 3, 4], [3, 4, 5, 6]);

    // function firstDuplicate(array) {
    //   let set = new Set();

    //   for (const item of array) {
    //     if (set.has(item)) {
    //       return item;
    //     } else {
    //       set.add(item);
    //     }
    //   }
    // }

    // return firstDuplicate([1, 3, 4, 2, 3, 1]);

    // function pagination(array: any[], page: number = 1, limit: number = 3) {

    //   return array.slice(limit * (page - 1), limit * page);
    // }

    // return pagination([1, 2, 3, 4, 5, 6, 7, 8, 9], 1, 3);

    // function Palindrome(text: string) {
    //   let cleanText = text.toLowerCase().replaceAll(' ', '');
    //   let reverseText = cleanText.split('').reverse().join('');
    //   return cleanText === reverseText;
    //   console.log(reverseText);
    // }

    // return Palindrome('A man a plan a canal Panama');

    function groupBy(arr: any) {
      return arr.reduce((acc: any, item) => {
        if (acc[item.type]) {
          acc[item.type].push({ name: item.name });
        } else {
          acc[item.type] = [{ name: item.name }];
        }

        return acc;
      }, {});
    }

    return groupBy([
      { type: 'fruit', name: 'apple' },
      { type: 'fruit', name: 'banana' },
      { type: 'veg', name: 'carrot' },
    ]);
  }

  @Post('test-pull')
  async sendNotification(@Body() body: { userId: number; message: string }) {
    // await this.notificationsService.notify(body.userId, body.message);
    // return { status: 'added to queue' };

    const users = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));

    await this.notificationsService.notifyUsers(users);

    return { status: 'jobs added' };
  }

  @Get('geo')
  async test(@Req() request: Request) {
    const ip =
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress;

    return { ip, city: await getCountryFromIP('87.242.77.197') };
  }
}
