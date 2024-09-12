import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { allowedOrigins } from './allowedOrigins';

export const corsOptions: CorsOptions = {
  origin: (
    origin: string,
    callback: (err: Error | null, isOK?: true) => any,
  ) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
