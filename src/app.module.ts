import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DetectionModule } from './components/detection/detection.module';
import { ModelModule } from './components/model/model.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    DetectionModule,
    ModelModule,
    ServeStaticModule.forRoot({ rootPath: join(__dirname, 'assets') }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
