import { config as loadDotenv } from "dotenv";

// Local .env only. On Cloud Run, secrets/env come from the service config.
loadDotenv({ quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

const NODE_ENV = optional("NODE_ENV") ?? "development";
const DATABASE_URL = required("DATABASE_URL");
const DIRECT_URL = optional("DIRECT_URL") ?? DATABASE_URL;
// Prisma schema reads process.env.DIRECT_URL for directUrl
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = DIRECT_URL;
}
const SESSION_SECRET = required("SESSION_SECRET");
const GOOGLE_CLIENT_ID = required("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = required("GOOGLE_CLIENT_SECRET");
const GOOGLE_REDIRECT_URI = required("GOOGLE_REDIRECT_URI");
const FRONTEND_URL = required("FRONTEND_URL");
const CORS_ORIGIN = optional("CORS_ORIGIN") ?? FRONTEND_URL;
const SESSION_TTL_DAYS = Number.parseInt(
  optional("SESSION_TTL_DAYS") ?? "7",
  10,
);
const PORT = Number.parseInt(optional("PORT") ?? "8080", 10);

const cookieSecureEnv = optional("COOKIE_SECURE");
const cookieSecure =
  cookieSecureEnv === undefined
    ? NODE_ENV === "production"
    : cookieSecureEnv === "true";

export const env = {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  DIRECT_URL,
  SESSION_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  FRONTEND_URL,
  CORS_ORIGIN,
  SESSION_TTL_DAYS,
  GOOGLE_PROJECT_ID: optional("GOOGLE_PROJECT_ID"),
  GOOGLE_AUTH_URI: optional("GOOGLE_AUTH_URI"),
  GOOGLE_TOKEN_URI: optional("GOOGLE_TOKEN_URI"),
  GOOGLE_AUTH_PROVIDER_CERT_URL: optional("GOOGLE_AUTH_PROVIDER_CERT_URL"),
  cookieSecure,
  corsOrigins: CORS_ORIGIN.split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};

export type Env = typeof env;
