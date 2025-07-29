import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsDateNotInPast', async: false })
@Injectable()
export class IsDateNotInPastConstraint implements ValidatorConstraintInterface {
  validate(date: Date) {
    const now = new Date();

    return date >= now;
  }

  defaultMessage() {
    return 'The date must not be in the Past';
  }
}

export function IsDateNotInPast(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateNotInPastConstraint,
    });
  };
}
