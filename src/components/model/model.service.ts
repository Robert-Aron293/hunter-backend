import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { FileUtils } from 'src/utils/file_utils';

@Injectable()
export class ModelService {
  async getModel(): Promise<JSON> {
    console.log(process.env.MODEL_FILE_PATH);
    return JSON.parse(
      readFileSync(
        FileUtils.toRelativePath(process.env.MODEL_FILE_PATH),
        'utf-8',
      ),
    );
  }
}
