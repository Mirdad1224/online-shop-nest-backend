import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  async generateHash(text: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(text, salt);

    return hash;
  }

  async compareHash(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash);
  }

  generateToken(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  generateSha256HashHex(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  generateSha256HashBase64(text: string): string {
    return crypto.createHash('sha256').update(text).digest('base64');
  }
}
