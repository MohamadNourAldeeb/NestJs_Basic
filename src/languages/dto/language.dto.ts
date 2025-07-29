import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.devorator';
import { enumTypeOfLanguageCodes } from 'src/common/enums/enums';

export class changeLanguageDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, {
    message: 'language id must be 10 digit',
  })
  language_id: string;
}

export class createLanguageDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 30, {
    message: 'name must be 10 digit',
  })
  @Trim()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 3, {
    message: 'language code  must be between 2 and 3 digit',
  })
  @Trim()
  code: string;
}
