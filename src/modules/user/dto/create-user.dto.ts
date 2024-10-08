import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8, 100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}

export class EmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class UsernameDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  username: string;
}
