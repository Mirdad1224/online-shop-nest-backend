import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { User } from 'src/modules/user/schemas/user.schema';

const ObjectId = mongoose.Schema.Types.ObjectId;

export type AuthRefreshTokenDocument = HydratedDocument<AuthRefreshToken>;

@Schema({ timestamps: true })
export class AuthRefreshToken {
  @Prop({ type: String })
  hashedRefreshToken: string;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop({ type: ObjectId, ref: 'User', default: null })
  user: User;
}

export const AuthRefreshTokenSchema =
  SchemaFactory.createForClass(AuthRefreshToken);
