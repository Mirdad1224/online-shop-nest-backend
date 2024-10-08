import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import CategoryEnum from 'src/types/enums/category.enum';

const ObjectId = mongoose.Schema.Types.ObjectId;

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String, trim: true, unique: true, required: true })
  title: string;

  @Prop({ type: String, trim: true, unique: true, required: true })
  englishTitle: string;

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

  @Prop({
    type: String,
    enum: CategoryEnum,
    default: CategoryEnum.Product,
    required: true,
  })
  type: CategoryEnum;

  @Prop({ type: ObjectId, ref: 'Category', default: null })
  parentId: Category | string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
