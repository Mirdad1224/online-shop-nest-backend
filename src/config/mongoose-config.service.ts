import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigProps } from 'src/types/IConfig';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(
    private readonly configService: ConfigService<ConfigProps>,
    // private readonly logger: AppLoggerService,
  ) {}
  createMongooseOptions(): MongooseModuleOptions {
    const uri = this.configService.getOrThrow('DB_URI');
    const dbName = this.configService.getOrThrow('DB_NAME');
    const [creds, host] = uri.split('@');
    Logger.debug(
      `📀 Connecting to ${host || creds}`,
      MongooseConfigService.name,
    );
    return {
      uri,
      dbName: dbName,
      autoIndex: true,
      connectionFactory: (connection: Connection): Connection => {
        if (connection.readyState === 1) {
          Logger.log(
            '📀 Database Connected successfully',
            MongooseConfigService.name,
          );
        }
        connection.on('connected', () => {
          Logger.debug('📀 Database connected', MongooseConfigService.name);
        });
        connection.on('disconnected', () => {
          Logger.warn('📀 Database disconnected', MongooseConfigService.name);
        });
        connection.on('error', (error) => {
          Logger.error(
            `📀 Database connection failed! for error: ${error.message}`,
            MongooseConfigService.name,
          );
        });
        return connection;
      },
    };
  }
}
