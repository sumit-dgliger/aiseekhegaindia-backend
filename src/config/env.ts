import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (Neon pooled URL)"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required (Neon direct URL)"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  FRONTEND_URL: z.string().url(),
  CORS_ORIGIN: z.string().min(1),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
  GOOGLE_PROJECT_ID: z.string().optional(),
  GOOGLE_AUTH_URI: z.string().url().optional(),
  GOOGLE_TOKEN_URI: z.string().url().optional(),
  GOOGLE_AUTH_PROVIDER_CERT_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema> & {
  cookieSecure: boolean;
  corsOrigins: string[];
};

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map(
        (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
      )
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  const data = result.data;
  const cookieSecure = data.COOKIE_SECURE ?? data.NODE_ENV === "production";

  return {
    ...data,
    cookieSecure,
    corsOrigins: data.CORS_ORIGIN.split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  };
}

export const env = parseEnv();
