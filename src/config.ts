import { config } from 'dotenv';

config();

export const appConfig = {
  databaseUrl: process.env.DATABASE_URL,
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
  apiUrl: process.env.API_URL,
  aws_region: process.env.AWS_REGION,
  aws_bucket_name: process.env.AWS_BUCKET_NAME,
};
