import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'The  email of user account',
  })
  @IsEmail()
  @IsNotEmpty()
  @Length(5, 150, {
    message: 'email must be between 5 and 150',
  })
  email: string;
  // ___________________________________________________
  @ApiProperty({
    example: 'Test@12345',
    description: 'The password of user account',
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
  password: string | null;
  // ___________________________________________________
  @ApiProperty({
    example: 'mohamad',
    description: 'The first name of user account',
  })
  @IsString()
  @Length(2, 100, {
    message: 'first_name must be between 2 and 100',
  })
  @ValidateIf((o) => o.first_name !== null)
  first_name: string | null;
  // ___________________________________________________
  @ApiProperty({
    example: 'deeb',
    description: 'The last name of user account',
  })
  @IsString()
  @Length(2, 100, {
    message: 'last_name must be between 2 and 100',
  })
  @ValidateIf((o) => o.last_name !== null)
  last_name: string | null;
  // ___________________________________________________
  @ApiProperty({
    example: 'Noor',
    description: 'The user name of user account',
  })
  @IsString({ message: 'user_name must be a string' })
  @IsNotEmpty()
  @Length(4, 50, {
    message: 'user_name must be between 4 and 50',
  })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/, {
    message: 'user name must be valid regex type',
  })
  user_name: string;
  // ___________________________________________________
  @ApiProperty({
    example: '+963966545667',
    description: 'The phone number of user account',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid and include country code if necessary',
  })
  phone_number: string;
  // ___________________________________________________
  @ApiProperty({
    example: 'aammffoo33',
    description: 'The _Id of role',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, {
    message: 'role_id must be 10 digit',
  })
  role_id: string;
  // ___________________________________________________
  @ApiProperty({
    example: ['asfasdgdaw'],
    description: 'The array of included permissions to user account',
  })
  @IsArray({ message: 'included permissions must be an array' })
  @IsInt({
    each: true,
    message: 'each value in included permissions must be a integer',
  })
  include_permissions: number[];
  // ___________________________________________________
  @ApiProperty({
    example: ['asfasdgdaw'],
    description: 'The array of excluded permissions to user account',
  })
  @IsArray({ message: 'excluded permissions must be an array' })
  @IsInt({
    each: true,
    message: 'each value in excluded permissions must be a integer',
  })
  exclude_permissions: number[];
}
