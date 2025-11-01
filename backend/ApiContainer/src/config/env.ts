import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment schema and parsing with sensible defaults for local dev.
 */
const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8080),
  API_BASE_PATH: z.string().default('/api/v1'),

  // Stores/integrations
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // Auth
  JWT_SECRET: z.string().optional(),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().optional(),
});

const parsed = EnvSchema.parse(process.env);

function splitOrigins(val?: string): string[] {
  const raw = (val && val.trim()) || '';
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function normalizePem(pem?: string): string | undefined {
  if (!pem) return undefined;
  if (pem.includes('\\n')) return pem.replace(/\\n/g, '\n');
  return pem;
}

const hasRsa = Boolean(parsed.JWT_PRIVATE_KEY && parsed.JWT_PUBLIC_KEY);
const hasSecret = Boolean(parsed.JWT_SECRET);
if (!hasRsa && !hasSecret) {
  // eslint-disable-next-line no-console
  console.warn('JWT secret/keys not provided. Using weak development default. DO NOT USE IN PRODUCTION.');
  parsed.JWT_SECRET = 'change_me_in_prod';
}
parsed.JWT_PRIVATE_KEY = normalizePem(parsed.JWT_PRIVATE_KEY);
parsed.JWT_PUBLIC_KEY = normalizePem(parsed.JWT_PUBLIC_KEY);

export const config = {
  port: parsed.PORT,
  apiBasePath: parsed.API_BASE_PATH,
  databaseUrl: parsed.DATABASE_URL || '',
  redisUrl: parsed.REDIS_URL || '',
  jwtSecret: parsed.JWT_SECRET,
  jwtPrivateKey: parsed.JWT_PRIVATE_KEY,
  jwtPublicKey: parsed.JWT_PUBLIC_KEY,
  // Default to local frontend origin if env not provided
  corsOrigin: splitOrigins(parsed.CORS_ORIGIN || 'http://localhost:3000'),
};

// PUBLIC_INTERFACE
export function getConfig() {
  /** Provides typed access to environment configuration. */
  return config;
}
