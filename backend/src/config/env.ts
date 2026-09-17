import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/linkora'),
  JWT_ACCESS_SECRET: z.string().min(16, 'Access token secret must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'Refresh token secret must be at least 16 chars'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  BASE_URL: z.string().default('http://localhost:5000'),
  IP_SALT: z.string().default('linkora_privacy_salt'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = _env.data;
