import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { CustomException } from './custom-error';
import * as fsExtra from 'fs-extra';
import { Request } from 'express';
import { File } from 'multer';
import * as path from 'path';
import { Socket, Server } from 'socket.io';
import { sendErrorHttpResponse } from '../services/request.service';
import { EVENTS } from './socket.event';
interface CustomRequest extends Request {
  file?: File;
}

export let removePic = async (myPath: string) => {
  if (await fsExtra.pathExists(myPath)) {
    await fsExtra.remove(`${myPath.replace(/\.\w+$/, '')}.webp`);
    await fsExtra.remove(myPath);
  }
};

@Catch(CustomException, HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: any | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<CustomRequest>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    let errors: any = null;
    let errorMessage = '';
    if (
      exception instanceof HttpException ||
      exception instanceof CustomException
    ) {
      errors = Array.isArray(exception.getResponse())
        ? exception.getResponse()
        : [exception.getResponse()];

      if (errors) {
        errors.forEach((error: any) => {
          if (typeof error === 'object' && error.message) {
            if (Array.isArray(error.message)) {
              errorMessage += error.message.join(', ') + ', ';
            } else if (typeof error.message === 'string') {
              errorMessage += error.message + ', ';
            }
          } else if (typeof error === 'string') {
            errorMessage += error + ', ';
          }
        });
      }
    } else {
      errorMessage = exception.message;
    }

    errorMessage = errorMessage.trim().replace(/,\s*$/, '');
    try {
      if (request.file) {
        const filePath = path.resolve(
          __dirname,
          '../../../',
          request.file.path,
        );
        await removePic(filePath);
      }
    } catch (error) {
      // console.error({ error });
    }

    const errorLine = exception.stack?.split('\n')[1] || '';
    let errorLineNumber: any = 1;
    let errorFilePath = 'not found path';

    if (errorLine.match(/:(\d+):\d+\)$/)) {
      errorLineNumber = errorLine.match(/:(\d+):\d+\)$/)[1];
    }
    if (errorLine.match(/\((.*):[0-9]+:[0-9]+\)$/)) {
      errorFilePath = errorLine.match(/\((.*):[0-9]+:[0-9]+\)$/)[1];
    }

    const errorDetails = {
      file: errorFilePath,
      line: errorLineNumber,
    };

    sendErrorHttpResponse(
      response,
      request,
      status,
      errorMessage,
      exception.name,
      errorDetails,
    );
  }
}

export function tryCatch(
  socket: Socket,
  server: Server,
  callback: (...args: any[]) => Promise<any>,
) {
  return async (...args: any[]) => {
    try {
      await callback(...args);
    } catch (error) {
      const formattedError = Array.isArray(error)
        ? error.map((item) => ({
            property: item.property,
            error: item.constraints,
          }))
        : { error: error.message };

      server.to(socket.id).emit(EVENTS.error, formattedError);
    }
  };
}
