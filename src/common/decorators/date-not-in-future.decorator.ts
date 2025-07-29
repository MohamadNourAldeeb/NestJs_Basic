// src/validators/date-not-in-future.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsDateNotInFuture', async: false })
@Injectable()
export class IsDateNotInFutureConstraint
  implements ValidatorConstraintInterface
{
  validate(date: Date) {
    const now = new Date();

    return date <= now; // يجب أن يكون التاريخ أقل من أو يساوي الآن
  }

  defaultMessage() {
    return 'The date must not be in the future';
  }
}

export function IsDateNotInFuture(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateNotInFutureConstraint,
    });
  };
}
