import { createHash, randomBytes } from "node:crypto";
import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";

const SCOPES = ["openid", "email", "profile"];

export function createOAuthClient(): OAuth2Client {
  return new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
  });
}

export function generatePkcePair(): {
  codeVerifier: string;
  codeChallenge: string;
} {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function generateOAuthState(): string {
  return randomBytes(24).toString("base64url");
}

export function buildGoogleAuthUrl(opts: {
  state: string;
  codeChallenge: string;
}): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "online",
    scope: SCOPES,
    state: opts.state,
    code_challenge: opts.codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256,
    prompt: "select_account",
  });
}

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  pictureUrl?: string | null;
};

export async function exchangeCodeForProfile(
  code: string,
  codeVerifier: string,
): Promise<GoogleProfile> {
  const client = createOAuthClient();
  const { tokens } = await client.getToken({
    code,
    codeVerifier,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
  });

  if (!tokens.id_token) {
    throw new Error("missing_id_token");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error("incomplete_id_token");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    emailVerified: Boolean(payload.email_verified),
    name: payload.name ?? null,
    pictureUrl: payload.picture ?? null,
  };
}
