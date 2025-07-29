import { Request } from 'express';
import { diskStorage, memoryStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'media');

const uploadProfilePath = path.join(
  __dirname,
  '..',
  '..',
  'uploads',
  'profiles',
);
if (!fs.existsSync(uploadProfilePath)) {
  fs.mkdirSync(uploadProfilePath, { recursive: true });
}

export const multerOptions = {
  public: {
    storage: diskStorage({
      destination: (req: Request, file: any, cb: any) => {
        const mimeType = file.mimetype;
        let newUploadPath: string = uploadPath;
        if (mimeType.startsWith('image')) {
          newUploadPath = path.join(newUploadPath, 'images');
        } else if (mimeType.startsWith('video')) {
          newUploadPath = path.join(newUploadPath, 'videos');
        } else {
          newUploadPath = path.join(newUploadPath, 'files');
        }

        if (!fs.existsSync(newUploadPath)) {
          fs.mkdirSync(newUploadPath);
        }
        cb(null, newUploadPath);
      },
      filename: (req: Request, file: any, cb: any) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
      },
    }),
  },
  profile: {
    storage: diskStorage({
      destination: (req: Request, file: any, cb: any) => {
        cb(null, uploadProfilePath);
      },
      filename: (req: Request, file: any, cb: any) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
      },
    }),
  },
  chunkMemoryStorage: {
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per chunk
  },
};
