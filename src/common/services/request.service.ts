import { Request, Response } from 'express';
import { LoggerService } from './logger.service';
import { storeError } from './store_error.service';
let logger = new LoggerService();
export const sendHttpResponse = (
  res: Response,
  status: number,
  data?: any,
  req?: Request,
) => {
  if (!data) {
    data = {
      message: 'operation accomplished successfully ',
      error_code: null,
    };
  }
  logger.log(req, data);
  return res.status(status).send({
    success: true,
    data,
  });
};
export const sendErrorHttpResponse = async (
  res: Response,
  req: Request,
  status: number | 400,
  errorMessage?: any,
  errorName?: string,
  errorDetails?: {
    file: string;
    line: string;
  },
) => {
  if (!errorMessage) {
    errorMessage = 'Internal Server Error';
  }
  let errorCode = null;

  if (
    errorName == 'ReferenceError' ||
    errorName == 'TypeError' ||
    errorName == 'SyntaxError' ||
    errorName == 'RangeError' ||
    errorName == 'URIError' ||
    errorName == 'EvalError' ||
    errorName == 'ConcurrentModificationError' ||
    errorName == 'PromiseRejectionError' ||
    errorName == 'Error' ||
    errorName == 'SequelizeValidationError' ||
    errorName == 'ModelNotInitializedError'
  ) {
    let errorData = {
      errorStatusCode: status,
      errorName,
      errorDetails,
      errorMessage,
    };
    errorCode = await storeError(req, errorData);
  }

  logger.error(errorMessage, status, errorDetails);

  return res.status(status).send({
    success: false,
    data: {
      message: errorMessage,
      error_code: errorCode,
    },
  });
};
