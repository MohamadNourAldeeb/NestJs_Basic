import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'bvty5ec7gi68h9nbytr6vti....',
    description: 'Refresh token you have',
  })
  @IsJWT({ message: 'refresh_token must be a jwt token' })
  @IsNotEmpty()
  refresh_token: string;
}
