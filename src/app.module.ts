import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseConfigService } from './config/mongoose-config.service';
import appConfig from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [appConfig],
    }),
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
