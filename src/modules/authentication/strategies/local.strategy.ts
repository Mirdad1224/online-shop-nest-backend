import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';

import { AuthenticationService } from '../authentication.service';
import { User } from 'src/modules/user/schemas/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthenticationService) {
    super({ usernameField: 'credential' });
  }

  async validate(credential: string, password: string): Promise<User> {
    const user = await this.authenticationService.validateUser(
      credential,
      password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid login credentials');
    }
    return user;
  }
}
