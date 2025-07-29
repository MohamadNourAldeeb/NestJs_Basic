// image-processing.service.ts
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageProcessingService {
  async compressToWebP(
    originalPath: string,
    outputFilename: string,
    quality: number = 50,
  ): Promise<string> {
    const webpPath = path.join(
      path.dirname(originalPath),
      `${outputFilename}.webp`,
    );
    try {
      await sharp(originalPath).toFormat('webp', { quality }).toFile(webpPath);
      return `${outputFilename}.webp`;
    } catch (error) {
      if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      let imageExt = ['jpeg', 'png', 'gif', 'jpg'];

      if (imageExt.includes(path.split('.')[1])) {
        if (fs.existsSync(path)) fs.unlinkSync(path);
        if (fs.existsSync(`${path.replace(/\.\w+$/, '')}.webp`))
          fs.unlinkSync(`${path.replace(/\.\w+$/, '')}.webp`);
      } else {
        if (fs.existsSync(path)) fs.unlinkSync(path);
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
