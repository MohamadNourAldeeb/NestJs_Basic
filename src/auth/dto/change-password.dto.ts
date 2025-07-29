import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class changePassDto {
  @ApiProperty({
    example: 'Test@12345',
    description: 'The old password of your account',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 3,
    minSymbols: 1,
    minUppercase: 1,
  })
  old_password: string;
  // ______________________________________________________________
  @ApiProperty({
    example: 'Test@12345',
    description: 'The new password of your account',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 3,
    minSymbols: 1,
    minUppercase: 1,
  })
  new_password: string;
}
