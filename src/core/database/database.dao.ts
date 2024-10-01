import { NotFoundException } from '@nestjs/common';
import {
  Model,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  SortOrder,
  SaveOptions,
  RootFilterQuery,
  ObjectId,
} from 'mongoose';

import { BaseQueryDto } from '../base-query.dto';

export abstract class DAO<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(doc: Partial<T>, options?: SaveOptions) {
    const createdDoc = new this.model(doc);
    return createdDoc.save(options);
  }

  instance(doc: Partial<T>) {
    return new this.model(doc);
  }

  async find(
    baseQuery: BaseQueryDto,
    filter: FilterQuery<T> = {},
    options?: QueryOptions,
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = '_id',
      sortOrder = 'asc',
    } = baseQuery;

    const skip = (page - 1) * limit;
    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const data = await this.model
      .find(filter, null, options)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCount = await this.model.countDocuments(filter).exec();

    return {
      data,
      totalCount,
      currentPage: page,
      nextPage: page + 1,
      previoousPage: page - 1,
      hasNextPage: limit * page < totalCount,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(totalCount / limit),
    };
  }

  async count(filter: FilterQuery<T> = {}, options?: QueryOptions) {
    return this.model.find(filter, null, options).countDocuments();
  }

  async findOne(filter: FilterQuery<T>, options?: QueryOptions) {
    const item = await this.model.findOne(filter, null, options);
    if (!item) {
      throw new NotFoundException(this.model.modelName + ' not found.');
    }
    return item;
  }

  async isExist(filter: FilterQuery<T>) {
    return this.model.exists(filter);
  }

  async findById(id: string | ObjectId, options?: QueryOptions) {
    const item = await this.model.findById(id, null, options);
    if (!item) {
      throw new NotFoundException(this.model.modelName + ' not found.');
    }
    return item;
  }

  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ) {
    // return this.model.findOneAndUpdate(filter, update, {
    //   new: true,
    //   ...options,
    // });
    const record = await this.model.findOne(filter, null, options);
    if (!record) {
      throw new NotFoundException(this.model.modelName + ' not found.');
    }
    Object.assign(record, update);
    await record.save();
    return record;
  }

  async updateById(
    id: string | ObjectId,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ) {
    // return this.model.findOneAndUpdate(filter, update, {
    //   new: true,
    //   ...options,
    // });
    const record = await this.model.findById(id, null, options);
    if (!record) {
      // return null;
      throw new NotFoundException(this.model.modelName + ' not found.');
    }
    Object.assign(record, update);
    await record.save();
    return record;
  }

  async deleteOne(filter: FilterQuery<T>, options?: QueryOptions) {
    const item = await this.findOne(filter, options);
    if (!item) {
      throw new NotFoundException(this.model.modelName + ' not found.');
    }
    return item.deleteOne();
  }

  // async deleteMulti(filter: FilterQuery<T>) {
  //   return this.model.deleteMany(filter);
  // }

  async deleteById(id: string | ObjectId, options?: QueryOptions) {
    const item = await this.findById(id, options);
    if (!item) {
      throw new NotFoundException(this.model.modelName + ' not found.');
    }
    return item.deleteOne();
    // return this.model.findByIdAndDelete(id, options);
  }

  async deleteMulti(filter: RootFilterQuery<T>) {
    return this.model.deleteMany(filter);
  }
}
