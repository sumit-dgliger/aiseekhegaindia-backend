import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export const ASID_COOKIE = "asid";
export const OAUTH_PKCE_COOKIE = "oauth_pkce";

export type SessionClaims = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

export type PkceCookiePayload = {
  state: string;
  codeVerifier: string;
};

export function signSessionToken(userId: string, email: string): string {
  return jwt.sign({ email }, env.SESSION_SECRET, {
    subject: userId,
    expiresIn: `${env.SESSION_TTL_DAYS}d`,
  });
}

export function verifySessionToken(token: string): SessionClaims {
  const payload = jwt.verify(token, env.SESSION_SECRET);
  if (typeof payload === "string" || !payload.sub || typeof payload.email !== "string") {
    throw new Error("invalid_token_claims");
  }
  return {
    sub: payload.sub,
    email: payload.email,
    iat: Number(payload.iat),
    exp: Number(payload.exp),
  };
}

export function setSessionCookie(reply: FastifyReply, token: string): void {
  reply.setCookie(ASID_COOKIE, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: env.SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(ASID_COOKIE, {
    path: "/",
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
  });
}

export function setPkceCookie(
  reply: FastifyReply,
  payload: PkceCookiePayload,
): void {
  reply.setCookie(OAUTH_PKCE_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
}

export function clearPkceCookie(reply: FastifyReply): void {
  reply.clearCookie(OAUTH_PKCE_COOKIE, {
    path: "/",
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
  });
}

export function readPkceCookie(
  request: FastifyRequest,
): PkceCookiePayload | null {
  const raw = request.cookies[OAUTH_PKCE_COOKIE];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PkceCookiePayload;
    if (
      typeof parsed.state !== "string" ||
      typeof parsed.codeVerifier !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
