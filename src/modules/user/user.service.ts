import { BadRequestException, Injectable } from '@nestjs/common';
import { FilterQuery, ObjectId, QueryOptions, SaveOptions } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UserDAO } from './user.dao';
import { BaseQueryDto } from 'src/core/base-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CloudinaryResponse,
  FileUploadService,
} from '../file-upload/file-upload.service';
import Role from 'src/types/enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly userDAO: UserDAO,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(createUserDto: CreateUserDto, options?: SaveOptions) {
    return this.userDAO.create(createUserDto, options);
  }

  async findAll(query: BaseQueryDto) {
    return this.userDAO.find(query);
  }

  async findAllAdmins(query: BaseQueryDto) {
    return this.userDAO.find(query, {
      role: { $in: [Role.ADMIN, Role.SUPERADMIN] },
    });
  }

  findById(id: string | ObjectId) {
    return this.userDAO.findById(id, {});
  }

  findOne(filter: FilterQuery<UserDocument>) {
    return this.userDAO.findOne(filter, {});
  }

  findByEmail(email: string, options?: QueryOptions) {
    return this.userDAO.findByEmail(email, options);
  }

  findByUsername(username: string, options?: QueryOptions) {
    return this.userDAO.findByUsername(username, options);
  }

  updateOne(
    filter: FilterQuery<UserDocument>,
    user: Partial<User>,
    options?: QueryOptions<UserDocument>,
  ) {
    return this.userDAO.updateOne(filter, user, options);
  }

  async promoteUser(id: string | ObjectId) {
    const user = await this.findById(id);
    if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
      throw new BadRequestException('This user is already promoted.');
    }
    user.role = Role.ADMIN;
    await user.save();
    return user;
  }

  async demoteUser(id: string | ObjectId) {
    const user = await this.findById(id);
    if (user.role === Role.USER) {
      throw new BadRequestException('This User is not an admin.');
    }
    user.role = Role.USER;
    await user.save();
    return user;
  }

  async updateById(id: string, body: UpdateUserDto, file: Express.Multer.File) {
    if (body.username) {
      const tempUser = await this.findByUsername(body.username);
      if (tempUser) {
        throw new BadRequestException('Username is already taken.');
      }
    }
    const user = await this.findById(id);
    let image: CloudinaryResponse | undefined = undefined;
    if (file) {
      image = await this.fileUploadService.uploadToCloudinary(file);
    }
    return this.userDAO.updateById(id, {
      ...body,
      avatar: image?.secure_url
        ? image.secure_url
        : user.avatar
          ? user.avatar
          : null,
    });
  }

  removeOne(filter: FilterQuery<UserDocument>, options?: QueryOptions) {
    return this.userDAO.deleteOne(filter, options);
  }

  removeById(id: string, options?: QueryOptions) {
    return this.userDAO.deleteById(id, options);
  }
}
