import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { IsDateNotInPast } from 'src/common/decorators/date-not-in-past.decorator';
import { Trim } from 'src/common/decorators/trim.devorator';
import { enumOsType, enumTypeVersion } from 'src/common/enums/enums';

export class CreateVersionDto {
  // _________________________________________________

  @ApiProperty({
    example: '0.0.1',
    description: 'The version of app ',
  })
  @IsString({ message: 'App version must be a string' })
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'App version must follow semantic versioning (e.g., 0.0.1)',
  })
  @Trim()
  app_version: string;
  // _________________________________________________

  @ApiProperty({
    example: 'app.apk',
    description: 'the name of app ',
  })
  @IsString()
  @Length(2, 100, {
    message: 'app name must be between 2 and 100',
  })
  @Trim()
  app_name: string;
  // _________________________________________________

  @ApiProperty({
    example: 'ios',
    description: 'The type of app are you used',
  })
  @IsEnum(enumOsType)
  app_type: enumOsType;
  // _________________________________________________

  @ApiProperty({
    example: 'optional',
    description: 'The priority of version you want',
  })
  @IsEnum(enumTypeVersion)
  priority: enumTypeVersion;
  // _________________________________________________

  @ApiProperty({
    example: 'this the first version of apk version',
    description: 'the description of version',
  })
  @IsString()
  @Length(2, 250, {
    message: 'description must be between 2 and 250',
  })
  @Trim()
  @ValidateIf((o) => o.description !== null)
  description: string | null;
  // _________________________________________________
  @ApiProperty({
    example: '2026-07-06',
    description: 'the expired date of version',
  })
  @IsDate()
  @Type(() => Date)
  @IsDateNotInPast()
  @ValidateIf((o) => o.expiredAt !== null)
  expiredAt: Date | null;
}
