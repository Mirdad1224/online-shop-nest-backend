import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';

import { DAO } from '../../core/database/database.dao';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserDAO extends DAO<UserDocument> {
  constructor(@InjectModel(User.name) model: Model<UserDocument>) {
    super(model);
  }

  async findByEmail(email: string, options?: QueryOptions) {
    return this.model.findOne({ email }, null, options);
  }

  async findByUsername(username: string, options?: QueryOptions) {
    return this.model.findOne({ username }, null, options);
  }
}
