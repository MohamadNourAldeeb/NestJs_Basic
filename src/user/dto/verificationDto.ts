import { Length, IsString, IsEmail } from 'class-validator'
export class verificationDto {
    @IsEmail()
    email: string
    @IsString()
    @Length(6, 6, { message: 'otp must be exactly 6 characters long' })
    otp: string
}
