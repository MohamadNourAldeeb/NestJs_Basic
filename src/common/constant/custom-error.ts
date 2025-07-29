import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  errorCode: number | null;

  constructor(
    message: string,
    errorCode?: number | null,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, status);
    this.errorCode = errorCode!;
  }
}
