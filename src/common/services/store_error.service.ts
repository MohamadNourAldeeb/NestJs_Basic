import { Request } from 'express';
import * as moment from 'moment';
import { Error } from 'src/error/entities/error.entity';
import { enumTypeOfError } from '../enums/enums';
import { UuidService } from './uuid.service';

let storeError = async (req: Request, error: any) => {
  let data = {};
  let errorRecord: any = null;
  const errorMessage = error.errorMessage;
  const errorName = error.errorName;

  console.log('Time is: ', moment().format('YYYY-MM-DD HH:MM:SS'), {
    error,
    path: req.url,
  });

  let error_number = null;

  let checkError = await Error.findOne({
    raw: true,
    where: { message: errorMessage.trim() },
  });
  errorRecord = checkError;

  if (checkError) {
    error_number = checkError.id;
    errorRecord.error_number = error_number;
  } else {
    errorRecord = await Error.create({
      type: enumTypeOfError.BACKEND,
      status_code: error.errorStatusCode,
      url_path: req.url,
      message: errorMessage,
      file: error.errorDetails.file,
      line: error.errorDetails.line,
    });
    error_number = errorRecord.dataValues.id;
    errorRecord = { ...errorRecord.dataValues, error_number };
  }

  // ! Send Email to Backend Developers
  //   if (process.env.DB_USER == 'admin')
  // await sendFiveHandredErrorsToDevelopers(errorRecord);
  return error_number;
};
export { storeError };
