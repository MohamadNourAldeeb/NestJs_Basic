import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
} from 'class-validator';
import { enumOsType, enumTypeOfLanguageCodes } from 'src/common/enums/enums';

export class signInDto {
  @ApiProperty({
    example: 'NoorAldeeb or test@gmail.com',
    description: 'The user name or email of your account',
  })
  @IsString({ message: 'user_name_or_email must be a string' })
  @IsNotEmpty()
  @Length(4, 100, {
    message: 'user_name_or_email must be between 4 and 100',
  })
  user_name_or_email: string;
  // ___________________________________________________
  @ApiProperty({
    example: 'Test@12345',
    description: 'The password of your account',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 3,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;
  // ___________________________________________________
  @ApiProperty({
    example: 'afbsgzdxzvzbnseaw3f454t3rwbvgffnhn',
    description: 'The token of google notification',
  })
  @IsString({ message: 'FCM token must be a string' })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9\-_:]+$/, {
    message: 'Invalid FCM token format',
  })
  fcm_token: string;
  // ___________________________________________________

  @ApiProperty({
    example: 'Iphone17',
    description: 'The name of device',
  })
  @IsString({ message: 'Device name must be a string' })
  @Length(2, 50, { message: 'Device name must be between 2 and 50 characters' })
  device_name: string;
  // _____________________________________________________________
  @ApiProperty({
    example: '0.0.1',
    description: 'The version of app are you used',
  })
  @IsString({ message: 'App version must be a string' })
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'App version must follow semantic versioning (e.g., 0.0.1)',
  })
  app_version: string;
  // _____________________________________________________________
  @ApiProperty({
    example: 'ios',
    description: 'The type of app are you used',
  })
  @IsEnum(enumOsType, { message: 'OS type must be a valid value from os type' })
  app_type: enumOsType;
  // _____________________________________________________________
  @ApiProperty({
    example: 'ar',
    description: 'The code of language are you used in app',
  })
  @IsEnum(enumTypeOfLanguageCodes, {
    message: 'language code type must be a valid value ',
  })
  language_code: enumTypeOfLanguageCodes;
}

export class SignInWithGoogleDto {
  // _____________________________________________________________

  @ApiProperty({
    example: 'uvbyinuoimponbhjghfgcfhjbhkjnlkmnlkbhjvgv',
    description: 'The token of google sign in ',
  })
  @IsString({ message: 'google token must be a string' })
  @Length(20, 2000, {
    message: 'google token must be between 20 and 2000 characters',
  })
  google_token: string;
  // _____________________________________________________________

  @ApiProperty({
    example: 'afbsgzdxzvzbnseaw3f454t3rwbvgffnhn',
    description: 'The token of google notification',
  })
  @IsString({ message: 'FCM token must be a string' })
  fcm_token: string;
  // _____________________________________________________________

  @ApiProperty({
    example: 'Iphone17',
    description: 'The name of device',
  })
  @IsString({ message: 'Device name must be a string' })
  @Length(2, 50, { message: 'Device name must be between 2 and 50 characters' })
  device_name: string;
  // _____________________________________________________________
  @ApiProperty({
    example: '0.0.1',
    description: 'The version of app are you used',
  })
  @IsString({ message: 'App version must be a string' })
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'App version must follow semantic versioning (e.g., 0.0.1)',
  })
  app_version: string;
  // _____________________________________________________________
  @ApiProperty({
    example: 'ios',
    description: 'The type of app are you used',
  })
  @IsEnum(enumOsType, { message: 'OS type must be a valid value from os type' })
  app_type: enumOsType;
  // _____________________________________________________________
  @ApiProperty({
    example: 'ar',
    description: 'The code of language are you used in app',
  })
  @IsEnum(enumTypeOfLanguageCodes, {
    message: 'language code type must be a valid value ',
  })
  language_code: enumTypeOfLanguageCodes;
}
