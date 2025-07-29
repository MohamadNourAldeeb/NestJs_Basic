import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  Length,
  Matches,
  ValidateIf,
  IsNumberString,
  IsNotEmpty,
  IsStrongPassword,
} from 'class-validator';
import { enumOsType, enumVerificationType } from 'src/common/enums/enums';

export class VerificationDto {
  @ApiProperty({
    example: 'mohamad21298801@gmail.com',
    description: 'The email you want to send otp to it',
  })
  @IsEmail()
  @IsNotEmpty()
  @Length(5, 150, {
    message: 'email must be between 5 and 150',
  })
  email: string;
  // ____________________________________________________________
  @ApiProperty({
    example: '2245',
    description: 'The otp you got it on email',
  })
  @IsNumberString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'OTP must be exactly 4 characters long' })
  otp: string;
  // ____________________________________________________________

  @ApiProperty({
    example: 'verification',
    description: 'The type of verification you want',
  })
  @IsEnum(enumVerificationType, {
    message: 'verification type must be a valid value from verification type',
  })
  @IsNotEmpty()
  verification_type: enumVerificationType;
  // ____________________________________________________________
  @ApiProperty({
    example: 'Test@1234',
    description: 'The new password you want ',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 3,
    minSymbols: 1,
    minUppercase: 1,
  })
  @ValidateIf((o) => o.password !== null)
  new_password: string | null;
  // ____________________________________________________________
}
