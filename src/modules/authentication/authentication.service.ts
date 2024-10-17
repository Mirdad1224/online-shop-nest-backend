import {
  BadRequestException,
  Body,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
import {
  CreateUserDto,
  EmailDto,
  UsernameDto,
} from '../user/dto/create-user.dto';
import { generateOtp } from 'src/utils/otp.util';
import otpTemplate from 'src/templates/otp.template';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EmailService } from '../email/email.service';
import resetPasswordTemplate from 'src/templates/resetPassword.template';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private cryptoService: CryptoService,
    private readonly authRefreshTokenService: AuthRefreshTokenService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    credential: string,
    password: string,
  ): Promise<User | null> {
    const isEmail = this.isEmail(credential);

    const user = isEmail
      ? await this.userService.findByEmail(credential)
      : await this.userService.findByUsername(credential);

    if (!user) {
      return null;
    }

    const isMatch = await user.correctOTP(password, user.password);

    if (isMatch) {
      return user;
    }
    return null;
  }

  private isEmail(credential: string): boolean {
    // Basic email regex to check if the credential is an email
    return /\S+@\S+\.\S+/.test(credential);
  }

  async register(body: CreateUserDto, req: Request) {
    const { email, username, password } = body;

    const tempUser = await this.userService.findByEmail(email);
    const tempUser2 = await this.userService.findByUsername(username);

    if (
      (tempUser && tempUser.isVerifiedEmail) ||
      (tempUser2 && tempUser2.isVerifiedEmail)
    ) {
      let message = '';
      if (tempUser && tempUser2) {
        message = 'Email and username already in use, Please login';
      } else if (tempUser) {
        message = 'Email already in use, Please login';
      } else {
        message =
          'username already in use, Please choose a different username or if it is yours, login with your credentials.';
      }
      throw new BadRequestException(message);
    } else if (tempUser || (tempUser2 && tempUser2.email === email)) {
      if (tempUser && !tempUser2) {
        tempUser.password = password;
        tempUser.username = username;
        await tempUser.save({ validateModifiedOnly: true });
        req.userId = tempUser._id.toString();
        await this.sendOtp(req);
        return 'OTP sent successfully';
      } else if (tempUser && tempUser2) {
        tempUser2.password = password;
        await tempUser2.save({ validateModifiedOnly: true });
        req.userId = tempUser2._id.toString();
        await this.sendOtp(req);
        return 'OTP sent successfully';
      } else if (tempUser2) {
        tempUser2.password = password;
        await tempUser2.save({ validateModifiedOnly: true });
        req.userId = tempUser2._id.toString();
        await this.sendOtp(req);
        return 'OTP sent successfully';
      }
    } else if (tempUser2 && tempUser2.email !== email) {
      throw new BadRequestException(
        'This username belongs to another email.please choose a different username or if it is yours enter the correct email',
      );
    } else {
      const newUser = await this.userService.create(body);
      if (newUser) {
        req.userId = newUser._id?.toString();
        await this.sendOtp(req);
        return 'OTP sent successfully';
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async sendOtp(req: Request) {
    const userId = req.userId;
    if (!userId) {
      throw new InternalServerErrorException();
    }
    const newOtp = generateOtp(6);
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000); //10 min

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new InternalServerErrorException();
    }
    user.otp_expire_time = otpExpireTime;
    user.otp = newOtp;
    console.log(user);
    await user.save({ validateModifiedOnly: true });

    this.emailService.sendMail(
      user.email,
      'Verification OTP',
      otpTemplate(user.username, newOtp),
    );
  }

  async verifyOtp(body: VerifyOtpDto, res: Response) {
    const { email, otp } = body;
    const user = await this.userService.findOne({
      email,
      otp_expire_time: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestException('Email is invalid or OTP is expired');
    }

    if (user.isVerifiedEmail) {
      throw new BadRequestException('Email is already verified');
    }

    if (!(await user.correctOTP(otp, user.otp!))) {
      throw new BadRequestException('OTP is incorrect');
    }

    user.isVerifiedEmail = true;
    user.isActive = true;
    user.otp = null;

    await user.save();

    return this.authRefreshTokenService.generateTokenPair(
      { id: user._id.toString(), role: user.role },
      res,
    );
  }

  async isEmailTaken(@Body() body: EmailDto) {
    const { email } = body;
    const user = await this.userService.findByEmail(email);

    if (user) {
      return true;
    }
    return false;
  }

  async isUsernameTaken(@Body() body: UsernameDto) {
    const { username } = body;
    const user = await this.userService.findByUsername(username);

    if (user) {
      return true;
    }
    return false;
  }

  login(res: Response, user?: Express.User) {
    if (!user?.id) {
      throw new InternalServerErrorException('User not set in request');
    }

    return this.authRefreshTokenService.generateTokenPair(user, res);
  }

  async forgetPassword(body: EmailDto) {
    const user = await this.userService.findByEmail(body.email);
    if (!user) {
      throw new NotFoundException('There is no user with this email address');
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${this.configService.get('FRONT_URL')}/auth/new-password?token=${resetToken}`;

    this.emailService.sendMail(
      user.email,
      'Reset Password',
      resetPasswordTemplate(user.username, resetUrl),
    );

    return 'Reset url has been sent to your email';
  }

  async resetPassword(body: ResetPasswordDto, res: Response) {
    const { password, token } = body;

    const hashedToken = this.cryptoService.generateSha256HashHex(token);

    const user = await this.userService.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestException('Token is invalid or expired');
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpire = null;

    await user.save();

    return this.authRefreshTokenService.generateTokenPair(
      { id: user._id.toString(), role: user.role },
      res,
    );
  }
}
