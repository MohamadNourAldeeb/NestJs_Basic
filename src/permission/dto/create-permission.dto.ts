import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CreatePermissionDto {
    @IsString()
    @IsNotEmpty({ message: 'mode must not be empty' })
    mode: string
    @IsString()
    @IsNotEmpty({ message: 'description must not be empty' })
    description: string
}
