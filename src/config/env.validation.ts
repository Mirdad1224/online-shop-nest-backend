import * as Joi from 'joi';
import { registerAs } from '@nestjs/config';
import JoiUtil, { JoiConfig } from 'src/utils/joi-util';
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
  };

  return JoiUtil.validate(configs);
});
