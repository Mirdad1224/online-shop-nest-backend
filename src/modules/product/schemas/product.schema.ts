import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Category } from 'src/modules/category/schemas/category.schema';
import { Review } from 'src/modules/review/schemas/review.schema';

const ObjectId = mongoose.Schema.Types.ObjectId;

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, trim: true, unique: true, required: true })
  title: string;

  @Prop({
    type: String,
    trim: true,
    unique: true,
    required: true,
    lowercase: true,
  })
  segment: string;

  @Prop({ type: String, trim: true, required: true })
  description: string;

  @Prop({ type: ObjectId, ref: 'Category', required: true })
  category: Category | string;

  @Prop({ type: String, required: true })
  imageLink: string;

  @Prop({
    type: [String],
    validate: {
      validator: function (v: any) {
        return v && v.length <= 6;
      },
      message: 'Gallery can be a maximum of 6 images',
    },
  })
  gallery: string[];

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  offPrice: number;

  @Prop({ type: Number, default: 0 })
  discount: number;

  @Prop({ type: String, required: true })
  brand: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: Number, default: 5 })
  rating: number;

  @Prop({ type: Number, default: 0, required: true })
  countInStock: number;

  @Prop({ type: [{ type: ObjectId, ref: 'Review' }] })
  reviews: Review[] | string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
