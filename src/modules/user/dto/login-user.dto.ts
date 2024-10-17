import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmailOrUsername } from 'src/validators/email-or-username.validator';

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmailOrUsername({
    message:
      'Credential must be a valid email or username (alphanumeric, 3-20 characters)',
  })
  credential: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8, 100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}
