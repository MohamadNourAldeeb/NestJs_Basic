import { ApiProperty } from '@nestjs/swagger';
import { IsIP, IsNotEmpty, IsString, Length } from 'class-validator';

export class IpBlockDto {
  // ___________________________________________________
  @ApiProperty({
    example: '192.168.1.1',
    description: 'The ip you want to block it ',
  })
  @IsNotEmpty()
  @IsIP()
  ip: string;
}

export class EmailBlockDto {
  @ApiProperty({
    example: 'aammffoo33',
    description: 'The user Id of Object',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, {
    message: 'user_id must be 10 digit',
  })
  user_id: string;
}

export class DeviceBlockDto {
  @ApiProperty({
    example: 'sm-avasfafs',
    description: 'The serial of device',
  })
  @IsString({ message: 'Device serial must be a string' })
  @Length(2, 50, {
    message: 'Device serial must be between 2 and 50 characters',
  })
  serial: string;
}
