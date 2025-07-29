import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.devorator';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'The email of your account',
  })
  @IsEmail()
  @Trim()
  email: string;
  // ____________________________________________________
  @ApiProperty({
    example: 'mohamad',
    description: 'your first name ',
  })
  @IsString()
  @Length(2, 100, {
    message: 'first_name must be between 2 and 100',
  })
  @Trim()
  @ValidateIf((o) => o.first_name !== null)
  first_name: string | null;
  // ____________________________________________________
  @ApiProperty({
    example: 'aldeeb',
    description: 'your last name ',
  })
  @IsString()
  @Length(2, 100, {
    message: 'last_name must be between 2 and 100',
  })
  @Trim()
  @ValidateIf((o) => o.last_name !== null)
  last_name: string | null;
  // ____________________________________________________
  @ApiProperty({
    example: 'Noor',
    description: 'your custom user name ',
  })
  @IsString({ message: 'user_name must be a string' })
  @IsNotEmpty()
  @Length(4, 50, {
    message: 'user_name must be between 4 and 50',
  })
  @Trim()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/, {
    message: 'user name must be valid regex type',
  })
  user_name: string;
  // ____________________________________________________
  @ApiProperty({
    example: '+963988887776',
    description: 'your phone number',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid and include country code if necessary',
  })
  @ValidateIf((o) => o.phone_number !== null)
  phone_number: string | null;
}
