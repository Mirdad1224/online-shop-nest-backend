export interface ConfigProps {
  NODE_ENV: string;
  PORT: number;
  DB_URI: string;
  DB_NAME: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  SERVER_URL: string;
  EMAIL_HOST: string;
  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
  FRONT_URL: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_S3_BUCKET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  STRIPE_SECRET_KEY: string;
  ZARINPAL_MERCHANT: string;
}
