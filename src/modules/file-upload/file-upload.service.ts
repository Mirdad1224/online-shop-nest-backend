import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import * as sharp from 'sharp';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async resizeImage(file: Express.Multer.File, fileName: string) {
    return await sharp(file.buffer)
      .jpeg({ quality: 60 })
      .toFile(`./public/uploads/images/${fileName}`);
  }

  async uploadToLocal(file: Express.Multer.File) {
    const fileName = `${Date.now()}_${file.originalname}`;
    try {
      await this.resizeImage(file, fileName);
      return { url: `/uploads/images/${fileName}` };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      throw new InternalServerErrorException();
    }
  }

  async uploadToS3(file: Express.Multer.File) {
    const s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
    });

    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: `${Date.now()}_${file.originalname}`,
      Body: file.buffer,
    };

    try {
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      const s3Url = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
      return { url: s3Url };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<CloudinaryResponse | undefined> {
    return new Promise<CloudinaryResponse | undefined>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
