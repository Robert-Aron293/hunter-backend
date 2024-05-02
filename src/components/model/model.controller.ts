import { Controller, Get } from '@nestjs/common';
import { ModelService } from './model.service';

@Controller('model')
export class ModelController {
  constructor(private modelService: ModelService) {}

  @Get()
  async get(): Promise<JSON> {
    return this.modelService.getModel();
  }
}
