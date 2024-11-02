import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import {
  extractRefreshTokenFromCookies,
  cookieConfig,
} from 'src/utils/cookies.util';
import { User } from './decorators/user.decorator';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LoginUserDto } from '../user/dto/login-user.dto';
import {
  CreateUserDto,
  EmailDto,
  UsernameDto,
} from '../user/dto/create-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private authRefreshTokenService: AuthRefreshTokenService,
  ) {}

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @Public()
  @ApiBody({ type: CreateUserDto })
  @Post('register')
  async register(@Body() body: CreateUserDto, @Req() req: Request) {
    return this.authenticationService.register(body, req);
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @ApiBody({ type: VerifyOtpDto })
  @Public()
  @Post('verify-otp')
  verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authenticationService.verifyOtp(body, res);
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @ApiBody({ type: CreateUserDto })
  @Public()
  @Post('is-email-taken')
  isEmailTaken(@Body() body: EmailDto) {
    return this.authenticationService.isEmailTaken(body);
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @ApiBody({ type: CreateUserDto })
  @Public()
  @Post('is-username-taken')
  isUsernameTaken(@Body() body: UsernameDto) {
    return this.authenticationService.isUsernameTaken(body);
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginUserDto })
  @Post('login')
  login(
    @Body() _body: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authenticationService.login(res, req.user);
  }

  @ApiBearerAuth()
  @Get('me')
  async me(
    @User() authUser: Express.User,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.header('Cache-Control', 'no-store');
    return this.userService.findById(authUser.id);
  }

  @Throttle({
    short: { limit: 1, ttl: 1000 },
    long: { limit: 2, ttl: 60000 },
  })
  @ApiBearerAuth()
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-tokens')
  refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user) {
      throw new InternalServerErrorException();
    }

    return this.authRefreshTokenService.generateTokenPair(
      (req.user as any).attributes,
      res,
      extractRefreshTokenFromCookies(req) as string,
      (req.user as any).refreshTokenExpiresAt,
    );
  }

  @Public()
  @Post('clear-auth-cookie')
  clearAuthCookie(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(cookieConfig.refreshToken.name);
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @ApiBody({ type: EmailDto })
  @Public()
  @Post('forget-password')
  forgetPassword(@Body() body: EmailDto) {
    return this.authenticationService.forgetPassword(body);
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @ApiBody({ type: EmailDto })
  @Public()
  @Post('reset-password')
  resetPassword(
    @Body() body: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authenticationService.resetPassword(body, res);
  }
}
