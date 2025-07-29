import { IsString, Length } from 'class-validator';

export class sendForAllAgentsDto {
  @IsString()
  @Length(1, 100, {
    message: 'title must be between 2 and 100',
  })
  title: string;

  @IsString()
  @Length(1, 250, {
    message: 'body must be between 2 and 250',
  })
  body: string;
}
