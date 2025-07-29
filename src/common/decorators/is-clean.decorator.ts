import { registerDecorator, ValidationOptions } from 'class-validator';
import { ProfanityService } from '../services/profanity.service';

const profanityService = new ProfanityService();

export function IsClean(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isClean',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          const result = profanityService.checkProfanity(value);
          return result.isClean;
        },
        defaultMessage: (args) => {
          const result = profanityService.checkProfanity(args.value);
          return `The text contains a prohibited word: ${result.match}`;
        },
      },
    });
  };
}
