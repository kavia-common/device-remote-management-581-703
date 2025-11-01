import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8080),
  API_BASE_PATH: z.string().default('/api/v1'),
  DATABASE_URL: z.string().optional(), // Do not hardcode; read from env
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().default('change_me_in_prod'),
  CORS_ORIGIN: z.string().optional()
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

/**
 * PUBLIC_INTERFACE
 * Returns configuration values for the application.
 */
export function getConfig() {
  /** Provides typed access to environment configuration. */
  return env;
}
