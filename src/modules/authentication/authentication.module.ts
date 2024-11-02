import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import {
  AuthRefreshToken,
  AuthRefreshTokenSchema,
} from './schemas/auth-refresh-token.schema';
import { AuthenticationDAO } from './authentication.dao';
import { UserModule } from '../user/user.module';
import { ConfigProps } from 'src/types/IConfig';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { CryptoModule } from '../crypto/crypto.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthRefreshToken.name, schema: AuthRefreshTokenSchema },
    ]),
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigProps>) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
    }),
    CryptoModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationDAO,
    AuthenticationService,
    AuthRefreshTokenService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
