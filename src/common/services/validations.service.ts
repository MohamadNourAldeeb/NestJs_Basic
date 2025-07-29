import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationDtoService {
  async validationDto(schemaDto: any, data: any) {
    const instance = plainToInstance(schemaDto, data);
    return await validateOrReject(instance);
  }
}
