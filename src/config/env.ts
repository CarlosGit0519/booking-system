import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3002),
  DATABASE_URL: z.url(),
  DATABASE_SCHEMA: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).default('public'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),
});

const parsedEnv = envSchema.parse(process.env);
const databaseUrl = new URL(parsedEnv.DATABASE_URL);
databaseUrl.searchParams.set('schema', parsedEnv.DATABASE_SCHEMA);

export const env = {
  ...parsedEnv,
  DATABASE_URL: databaseUrl.toString(),
};
