import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment schema and parsing with sensible defaults for local dev.
 * Supports either symmetric JWT secret or RSA keypair.
 */
const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8080),
  API_BASE_PATH: z.string().default('/api/v1'),

  // Integrations
  DATABASE_URL: z.string().optional(), // Do not hardcode; read from env
  REDIS_URL: z.string().optional(),

  // Auth - either provide JWT_SECRET or both JWT_PRIVATE_KEY and JWT_PUBLIC_KEY
  JWT_SECRET: z.string().optional(),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().optional(),

  // External protocol services
  ECO_ACS_URL: z.string().optional(),
  WEBPA_URL: z.string().optional(),
  USP_URL: z.string().optional(),

  // Security / hashing
  PASSWORD_SALT_ROUNDS: z.coerce.number().default(12)
});

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', result.error.flatten().fieldErrors);
  process.exit(1);
}

type Env = z.infer<typeof EnvSchema>;

// normalize RSA PEM values if they are provided as single lines with \n
function normalizePem(pem?: string): string | undefined {
  if (!pem) return undefined;
  // if contains literal '\n', replace with actual newlines
  if (pem.includes('\\n')) return pem.replace(/\\n/g, '\n');
  return pem;
}

const parsed = result.data as Env;

// Determine JWT configuration validity
const hasRsaPair = Boolean(parsed.JWT_PRIVATE_KEY && parsed.JWT_PUBLIC_KEY);
const hasSecret = Boolean(parsed.JWT_SECRET);

// If neither RSA nor secret present, set a dev default secret (warn only in dev)
if (!hasRsaPair && !hasSecret) {
  // eslint-disable-next-line no-console
  console.warn('JWT secret/keys not provided. Using weak development default. DO NOT USE IN PRODUCTION.');
  parsed.JWT_SECRET = 'change_me_in_prod';
}

// Apply PEM normalization
parsed.JWT_PRIVATE_KEY = normalizePem(parsed.JWT_PRIVATE_KEY);
parsed.JWT_PUBLIC_KEY = normalizePem(parsed.JWT_PUBLIC_KEY);

export const env = parsed;

/**
 * PUBLIC_INTERFACE
 * Returns configuration values for the application.
 */
export function getConfig() {
  /** Provides typed access to environment configuration. */
  return env;
}

/**
 * PUBLIC_INTERFACE
 * Returns the preferred JWT signing material. If RSA keys are present, uses RS256; else HS256.
 */
export function getJwtMaterial(): {
  /** 'rsa' or 'hmac' */
  type: 'rsa' | 'hmac';
  /** Private key for RSA or shared secret for HMAC */
  privateOrSecret: string;
  /** Public key for RSA if available */
  publicKey?: string;
  /** Recommended algorithm */
  algorithm: 'RS256' | 'HS256';
} {
  if (env.JWT_PRIVATE_KEY && env.JWT_PUBLIC_KEY) {
    return {
      type: 'rsa',
      privateOrSecret: env.JWT_PRIVATE_KEY,
      publicKey: env.JWT_PUBLIC_KEY,
      algorithm: 'RS256'
    };
    }
  if (!env.JWT_SECRET) {
    throw new Error('JWT configuration is invalid: no secret or RSA keys available after normalization.');
  }
  return {
    type: 'hmac',
    privateOrSecret: env.JWT_SECRET,
    algorithm: 'HS256'
  };
}

/**
 * PUBLIC_INTERFACE
 * Returns external protocol service endpoints with fallbacks for local dev.
 */
export function getProtocolServiceUrls() {
  return {
    ecoAcsUrl: env.ECO_ACS_URL ?? 'http://localhost:9001',
    webpaUrl: env.WEBPA_URL ?? 'http://localhost:9002',
    uspUrl: env.USP_URL ?? 'http://localhost:9003'
  };
}
