import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DAO } from '../../core/database/database.dao';
import {
  AuthRefreshToken,
  AuthRefreshTokenDocument,
} from './schemas/auth-refresh-token.schema';

@Injectable()
export class AuthenticationDAO extends DAO<AuthRefreshTokenDocument> {
  constructor(
    @InjectModel(AuthRefreshToken.name) model: Model<AuthRefreshTokenDocument>,
  ) {
    super(model);
  }
}
