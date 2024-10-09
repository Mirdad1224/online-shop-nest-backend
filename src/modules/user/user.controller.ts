import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  Body,
  Patch,
  UploadedFile,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';

import { UserService } from './user.service';
import { ResponseMessage } from 'src/decorators/response-message.decorator';
import { Roles } from '../authorization/decorators/roles.decorator';
import Role from 'src/types/enums/role.enum';
import { BaseQueryDto } from 'src/core/base-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiFile } from '../file-upload/decorators/api-file.decorator';
import { fileMimetypeFilter } from '../file-upload/filters/file-mimetype.filter';
import { ParseFile } from '../file-upload/pipes/parse-file.pipe';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ResponseMessage('Users fetched successfully.')
  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.userService.findAll(query);
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ResponseMessage('User fetched successfully.')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ResponseMessage('User fetched successfully.')
  @Get('/username/:username')
  findByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ResponseMessage('User fetched successfully.')
  @Get('/email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @ResponseMessage('User updated successfully.')
  @ApiBody({ type: UpdateUserDto })
  @ApiBearerAuth()
  @ApiFile('avatar', true, { fileFilter: fileMimetypeFilter('image') })
  @ApiConsumes('multipart/form-data') // Specify the type of request
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'fullName' },
        username: { type: 'string', example: 'username' },
        image: {
          type: 'string',
          format: 'binary', // Specify it's a file
        },
      },
      required: [], // Specify required fields
    },
  })
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFile(ParseFile) file: Express.Multer.File,
    @Body() body: UpdateUserDto,
  ) {
    if (
      req.user?.id !== id &&
      req.user?.role !== Role.SUPERADMIN &&
      req.user?.role !== Role.ADMIN
    ) {
      return new ForbiddenException(
        'You are not authorized to update this user',
      );
    }
    return this.userService.updateById(id, body, file);
  }

  @Roles(Role.SUPERADMIN)
  @ResponseMessage('User deleted successfully.')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.removeById(id);
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ResponseMessage('Admins fetched successfully.')
  @Get('/admins/all')
  findAllAdmins(@Query() query: BaseQueryDto) {
    return this.userService.findAllAdmins(query);
  }

  @Roles(Role.SUPERADMIN)
  @ResponseMessage('User promoted successfully.')
  @Patch('/admins/:id')
  addAdmin(@Param('id') id: string) {
    return this.userService.promoteUser(id);
  }

  @Roles(Role.SUPERADMIN)
  @ResponseMessage('User demoted successfully.')
  @Delete('/admins/:id')
  removeAdmin(@Param('id') id: string) {
    return this.userService.demoteUser(id);
  }
}
