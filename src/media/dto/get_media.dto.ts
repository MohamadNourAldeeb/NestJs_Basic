import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { enumTypeOfMedia } from 'src/common/enums/enums';
import { PaginationWithSearchQueries } from 'src/common/global/dto/global.dto';

export class GetMediaDto extends PaginationWithSearchQueries {
  @ApiProperty({
    example: 'image',
    description: 'The type of media you need filter',
  })
  @IsEnum(enumTypeOfMedia)
  @IsOptional()
  app_type: enumTypeOfMedia;
}
