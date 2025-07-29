import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsClean } from 'src/common/decorators/is-clean.decorator';
import { Trim } from 'src/common/decorators/trim.devorator';

export class IdDto {
  @ApiProperty({
    example: 'aammffoo33',
    description: 'The _Id of Object',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Length(10, 10, {
    message: '_id must be 10 digit',
  })
  _id: string;
}

export class IdParamsDto {
  @ApiProperty({
    example: 'aammffoo33',
    description: 'The _Id of ting',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, {
    message: 'id must be 10 digit',
  })
  id: string;
}

export class PaginationQueries {
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
  @Min(1)
  @Max(1000)
  size: number;
}

export class PaginationWithSearchQueries {
  @ApiProperty({
    example: 1,
    description: 'The number of the page',
  })
  @Type(() => Number)
  @IsInt({ message: 'page must be a number.' })
  @IsPositive({ message: 'page must be a positive number.' })
  @Min(1)
  page: number;

  @ApiProperty({
    example: 10,
    description: "The number of the page's size",
  })
  @Type(() => Number)
  @IsInt({ message: 'size must be a number.' })
  @IsPositive({ message: 'size must be a positive number.' })
  @Min(1)
  @Max(1000)
  size: number;

  @ApiProperty({
    example: 'homs',
    description: 'The text of search',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsOptional()
  @Trim()
  @IsClean()
  q: string;
}
