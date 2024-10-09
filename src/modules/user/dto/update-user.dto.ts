import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalNonNullable } from 'src/validators/is-optional-non-nullable.validator';
import { IsImageFile } from 'src/validators/is-image-file.validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptionalNonNullable()
  @IsString()
  @Length(3, 100)
  fullName: string;

  @ApiProperty()
  @IsOptionalNonNullable()
  @IsString()
  @Length(3, 100)
  username: string;

  @ApiProperty()
  @IsOptionalNonNullable()
  @IsImageFile()
  avatar: Express.Multer.File;
}
