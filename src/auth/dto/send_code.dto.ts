import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { enumOsType } from 'src/common/enums/enums';

export class sendCodeDto {
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
}
