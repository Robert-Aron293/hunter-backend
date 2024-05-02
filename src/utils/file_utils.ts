import { dirname, join } from 'path';

export class FileUtils {
  static toRelativePath(pathFromProjectRoot: string): string {
    return join(dirname(require.main.filename), pathFromProjectRoot);
  }
}
