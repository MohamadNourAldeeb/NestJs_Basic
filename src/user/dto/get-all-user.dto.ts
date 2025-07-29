import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Min,
  IsInt,
  IsOptional,
  IsNumber,
  IsBoolean,
  Max,
  IsPositive,
  IsString,
  MinLength,
  MaxLength,
  Length,
  IsEnum,
} from 'class-validator';
import { enumTypeOfRole } from 'src/common/enums/enums';

export class GetAllUserDto {
  @ApiProperty({
    example: 1,
    description: 'The number of the page',
  })
  @Type(() => Number)
  @IsInt({ message: 'page must be a number.' })
  @IsPositive({ message: 'page must be a positive number.' })
  page: number;

  @ApiProperty({
    example: 10,
    description: "The number of the page's size",
  })
  @Type(() => Number)
  @IsInt({ message: 'size must be a number.' })
  @IsPositive({ message: 'size must be a positive number.' })
  size: number;

  @ApiProperty({
    example: 'homs',
    description: 'The text of search',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsOptional()
  q: string;

  @ApiProperty({
    example: 'admin',
    description: 'The type of role you want to filter',
  })
  @IsEnum(enumTypeOfRole)
  @IsOptional()
  role: enumTypeOfRole;
}
