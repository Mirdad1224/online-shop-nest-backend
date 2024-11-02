import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { ConfigProps } from 'src/types/IConfig';
import { extractRefreshTokenFromCookies } from 'src/utils/cookies.util';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<ConfigProps>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => extractRefreshTokenFromCookies(req),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid refresh jwt payload.');
    }

    return {
      attributes: { id: payload.sub, role: payload.role },
      refreshTokenExpiresAt: new Date(payload.exp * 1000),
    };
  }
}
