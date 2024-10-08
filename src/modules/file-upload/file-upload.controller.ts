import {
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiFile } from './decorators/api-file.decorator';
import { FileUploadService } from './file-upload.service';
import { fileMimetypeFilter } from './filters/file-mimetype.filter';
import { ParseFile } from './pipes/parse-file.pipe';
import { Public } from '../authentication/decorators/public.decorator';

@Controller('files')
@ApiTags('files')
export class FileUploadController {
  constructor(private readonly filesService: FileUploadService) {}

  @Public()
  @Post('upload')
  @ApiFile('avatar', true, { fileFilter: fileMimetypeFilter('image') })
  uploadFile(@UploadedFile(ParseFile) file: Express.Multer.File) {
    return this.filesService.uploadToLocal(file);
  }

  @Public()
  @Post('upload/cl')
  @ApiFile('avatar', true, { fileFilter: fileMimetypeFilter('image') })
  async uploadFilecload(@UploadedFile(ParseFile) file: Express.Multer.File) {
    const res = await this.filesService.uploadToCloudinary(file);
    if (!res) {
      throw new InternalServerErrorException();
    }
    return { url: res.secure_url };
  }
}
