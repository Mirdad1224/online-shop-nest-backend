import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Response } from 'express';
import { ObjectId } from 'mongoose';

import { CryptoService } from '../crypto/crypto.service';
import { ConfigProps } from 'src/types/IConfig';
import { AuthenticationDAO } from './authentication.dao';
import { User } from '../user/schemas/user.schema';
import { cookieConfig } from 'src/utils/cookies.util';

@Injectable()
export class AuthRefreshTokenService {
  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private configService: ConfigService<ConfigProps>,
    private readonly authenticationDAO: AuthenticationDAO,
  ) {}

  async generateRefreshToken(
    authUser: Express.User,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ) {
    const newRefreshToken = this.jwtService.sign(
      { sub: authUser.id, role: authUser.role },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    if (currentRefreshToken && currentRefreshTokenExpiresAt) {
      const hashedRefreshToken =
        this.cryptoService.generateSha256HashBase64(currentRefreshToken);
      if (
        await this.isRefreshTokenBlackListed(hashedRefreshToken, authUser.id)
      ) {
        throw new UnauthorizedException('Invalid refresh token.');
      }
      await this.authenticationDAO.create({
        hashedRefreshToken,
        expiresAt: currentRefreshTokenExpiresAt,
        user: authUser.id as unknown as User,
      });
    }

    return newRefreshToken;
  }

  private isRefreshTokenBlackListed(
    hashedRefreshToken: string,
    userId: string | ObjectId,
  ) {
    return this.authenticationDAO.isExist({ hashedRefreshToken, user: userId });
  }

  async generateTokenPair(
    user: Express.User,
    res: Response,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ) {
    const payload = { sub: user.id, role: user.role };

    res.cookie(
      cookieConfig.refreshToken.name,
      await this.generateRefreshToken(
        user,
        currentRefreshToken,
        currentRefreshTokenExpiresAt,
      ),
      {
        ...cookieConfig.refreshToken.options,
      },
    );

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async clearExpiredRefreshTokens() {
    await this.authenticationDAO.deleteMulti({
      expiresAt: { $lte: new Date() },
    });
  }
}
