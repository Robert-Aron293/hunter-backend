import { Body } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Controller, Post } from '@nestjs/common';
import { UrlDto } from 'src/dto/url.dto';
import { DetectionService } from './detection.service';

@Controller('detection')
export class DetectionController {
  constructor(private detectionService: DetectionService) {}
  // constructor() {}

  @Post()
  async scan(@Body() urlDto: UrlDto): Promise<boolean> {
    return this.detectionService.isUrlMalicious(urlDto.url);
    // return urlDto.url;
  }

  @Get()
  async get(): Promise<string> {
    return 'get_scanning';
  }
}
