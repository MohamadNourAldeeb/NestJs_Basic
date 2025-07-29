import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsClean } from 'src/common/decorators/is-clean.decorator';
import { Trim } from 'src/common/decorators/trim.devorator';
import { enumTypeOfBlock } from 'src/common/enums/enums';
import { PaginationWithSearchQueries } from 'src/common/global/dto/global.dto';

export class blockListQueryDto extends PaginationWithSearchQueries {
  @ApiProperty({
    example: 'device',
    description: 'The priority of block you want to filter',
  })
  @IsEnum(enumTypeOfBlock)
  type: enumTypeOfBlock;
}
export class IpBlockListQueryDto {
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
