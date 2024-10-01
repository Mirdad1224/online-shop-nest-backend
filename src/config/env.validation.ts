import * as Joi from 'joi';
import { registerAs } from '@nestjs/config';
import JoiUtil, { JoiConfig } from 'src/utils/joi.util';
import { ConfigProps } from 'src/types/IConfig';

export default registerAs('my-app-config-namespace', (): ConfigProps => {
  const configs: JoiConfig<ConfigProps> = {
    NODE_ENV: {
      value: process.env.NODE_ENV,
      joi: Joi.string().required().valid('development', 'production'),
    },
    PORT: {
      value: parseInt(process.env.PORT!),
      joi: Joi.number().required(),
    },
    DB_URI: {
      value: process.env.DB_URI,
      joi: Joi.string().required(),
    },
    DB_NAME: {
      value: process.env.DB_NAME,
      joi: Joi.string().required(),
    },
    JWT_ACCESS_SECRET: {
      value: process.env.JWT_ACCESS_SECRET,
      joi: Joi.string().required(),
    },
    JWT_REFRESH_SECRET: {
      value: process.env.JWT_REFRESH_SECRET,
      joi: Joi.string().required(),
    },
    SERVER_URL: {
      value: process.env.SERVER_URL,
      joi: Joi.string().uri().required(),
    },
    EMAIL_HOST: {
      value: process.env.EMAIL_HOST,
      joi: Joi.string().required(),
    },
    EMAIL_USERNAME: {
      value: process.env.EMAIL_USERNAME,
      joi: Joi.string().required(),
    },
    EMAIL_PASSWORD: {
      value: process.env.EMAIL_PASSWORD,
      joi: Joi.string().required(),
    },
    FRONT_URL: {
      value: process.env.FRONT_URL,
      joi: Joi.string().uri().required(),
    },
    AWS_ACCESS_KEY_ID: {
      value: process.env.AWS_ACCESS_KEY_ID,
      joi: Joi.string().required(),
    },
    AWS_SECRET_ACCESS_KEY: {
      value: process.env.AWS_SECRET_ACCESS_KEY,
      joi: Joi.string().required(),
    },
    AWS_REGION: {
      value: process.env.AWS_REGION,
      joi: Joi.string().required(),
    },
    AWS_S3_BUCKET: {
      value: process.env.AWS_S3_BUCKET,
      joi: Joi.string().required(),
    },
    CLOUDINARY_CLOUD_NAME: {
      value: process.env.CLOUDINARY_CLOUD_NAME,
      joi: Joi.string().required(),
    },
    CLOUDINARY_API_KEY: {
      value: process.env.CLOUDINARY_API_KEY,
      joi: Joi.string().required(),
    },
    CLOUDINARY_API_SECRET: {
      value: process.env.CLOUDINARY_API_SECRET,
      joi: Joi.string().required(),
    },
    STRIPE_SECRET_KEY: {
      value: process.env.STRIPE_SECRET_KEY,
      joi: Joi.string().required(),
    },
    ZARINPAL_MERCHANT: {
      value: process.env.ZARINPAL_MERCHANT,
      joi: Joi.string().required(),
    },
  };

  return JoiUtil.validate(configs);
});
