import {
  Controller, Post, UseInterceptors, UploadedFile,
  BadRequestException, Get, Param, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const fs = require('fs');
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const ext = extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Faqat PDF, DOC, DOCX, JPG, PNG, WEBP fayllar ruxsat etilgan'), false);
  }
};

@ApiTags('Upload')
@Controller('upload')
export class UploadController {

  @Post()
  @ApiOperation({ summary: 'Upload a file (resume, photo)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fayl yuklanmadi');
    return {
      url: `/api/upload/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Get uploaded file' })
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    // Sanitize filename
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = join(UPLOAD_DIR, safe);
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.sendFile(filePath);
  }
}
