import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6)
  otp: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
