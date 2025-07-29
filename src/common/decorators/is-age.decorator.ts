import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsAgeBetween', async: false })
export class IsAgeBetweenConstraint implements ValidatorConstraintInterface {
  validate(birthDate: Date, args: any): boolean {
    const [minAge, maxAge] = args.constraints;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const birthMonthDay = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate(),
    );

    if (birthMonthDay > today) {
      age--;
    }

    return age >= minAge && age <= maxAge;
  }

  defaultMessage(args: any): string {
    const [minAge, maxAge] = args.constraints;
    return `The age must be between ${minAge} and ${maxAge} years.`;
  }
}

export function IsAgeBetween(
  minAge: number,
  maxAge: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minAge, maxAge],
      validator: IsAgeBetweenConstraint,
    });
  };
}
