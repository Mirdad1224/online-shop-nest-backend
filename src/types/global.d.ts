import { ObjectId } from 'mongoose';
import Role from './enums/role.enum';

export {};

declare global {
  namespace Express {
    interface User {
      id: string | ObjectId;
      role: Role;
    }
    export interface Request {
      userId?: string | ObjectId;
    }
  }
}
