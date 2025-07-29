import {
  IS_EMPTY,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsFirebasePushId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { enumTypeOfLanguageCodes } from 'src/common/enums/enums';

export class signUpAuthDto {
  @ValidateIf((o) => o.email !== undefined)
  @IsEmail()
  @IsOptional()
  @Length(5, 150, {
    message: 'name must be between 5 and 150',
  })
  email: string | null;

  @IsString({ message: 'Phone number must be a string' })
  @ValidateIf((o) => o.phone_number !== undefined)
  @IsOptional()
  @Matches(/^09[0-9]{8}$/, {
    message: 'Phone number must be in international format (e.g. , 0912345678)',
  })
  phone_number: string | null;

  @IsEnum(enumTypeOfLanguageCodes, {
    message: 'language id type must be a valid value ',
  })
  language_code: enumTypeOfLanguageCodes;
}
