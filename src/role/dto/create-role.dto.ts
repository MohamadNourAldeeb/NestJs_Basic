import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'role_name must not be empty' })
  @Length(2, 200, {
    message: 'role_name must be between 2 and 200',
  })
  role_name: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
