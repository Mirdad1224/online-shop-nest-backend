import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { CryptoService } from 'src/modules/crypto/crypto.service';
import { Product } from 'src/modules/product/schemas/product.schema';
import Role from 'src/types/enums/role.enum';

const ObjectId = mongoose.Schema.Types.ObjectId;

export type UserDocument = HydratedDocument<User>;

@Schema({
  toJSON: {
    virtuals: true,
    transform: function (_doc, ret) {
      delete ret.password;
      return ret;
    },
  },
  timestamps: true,
})
export class User {
  @Prop({ type: String, trim: true, unique: true, required: true, index: true })
  @ApiProperty()
  username: string;

  @Prop({ type: String, trim: true })
  password: string;

  @Prop({
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    index: true,
  })
  @ApiProperty()
  email: string;

  @Prop({ type: String, trim: true })
  @ApiProperty()
  fullName: string;

  @Prop()
  @ApiProperty()
  avatar: string;

  @Prop({ type: [{ type: ObjectId, ref: 'Product' }] })
  @ApiProperty()
  favorites: Product[];

  @ApiProperty()
  @Prop(
    raw({
      totalAmount: { type: Number, default: 0 },
      coupon: { type: ObjectId, ref: 'Coupon' },
      totalQTY: { type: Number, default: 0 },
      cartItems: [
        {
          productId: {
            type: ObjectId,
            ref: 'Product',
            required: true,
            default: null,
          },
          cartQTY: { type: Number },
        },
      ],
    }),
  )
  cart: Record<string, any>;

  @Prop({ type: String })
  otp: string | null;

  @Prop({ type: Date })
  otp_expire_time: Date;

  @Prop({ type: Boolean, default: false })
  @ApiProperty()
  isVerifiedEmail: boolean;

  @Prop({ type: Boolean, default: false })
  @ApiProperty()
  isActive: boolean;

  @Prop({ type: String, enum: Role, default: Role.USER })
  @ApiProperty()
  role: Role;

  @Prop({ type: Date })
  passwordChangedAt: Date | number;

  @Prop({ type: String })
  passwordResetToken: string | null;

  @Prop({ type: Date })
  passwordResetExpire: Date | number | null;

  async correctOTP(candidateOTP: string, userOTP: string) {
    const cryptoService = new CryptoService();
    return await cryptoService.compareHash(candidateOTP, userOTP);
  }

  async correctPassword(candidatePassword: string, userPassword: string) {
    const cryptoService = new CryptoService();
    return await cryptoService.compareHash(candidatePassword, userPassword);
  }

  createPasswordResetToken() {
    const cryptoService = new CryptoService();
    const resetToken = cryptoService.generateToken(32);

    this.passwordResetToken = cryptoService.generateSha256HashHex(resetToken);

    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);
