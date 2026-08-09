import { env } from "../../config/env.js";
import * as usersService from "../users/users.service.js";
import {
  buildGoogleAuthUrl,
  exchangeCodeForProfile,
  generateOAuthState,
  generatePkcePair,
} from "./google.js";
import {
  clearPkceCookie,
  clearSessionCookie,
  readPkceCookie,
  setPkceCookie,
  setSessionCookie,
  signSessionToken,
  type PkceCookiePayload,
} from "./session.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export function startGoogleOAuth(reply: FastifyReply): void {
  const state = generateOAuthState();
  const { codeVerifier, codeChallenge } = generatePkcePair();
  setPkceCookie(reply, { state, codeVerifier });
  const url = buildGoogleAuthUrl({ state, codeChallenge });
  reply.redirect(url);
}

export async function handleGoogleCallback(
  request: FastifyRequest<{
    Querystring: { code?: string; state?: string; error?: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const frontBase = env.FRONTEND_URL.replace(/\/$/, "");
  const successRedirect = `${frontBase}/auth/callback`;
  const errorRedirect = (reason: string) =>
    reply.redirect(
      `${frontBase}/auth/callback?error=${encodeURIComponent(reason)}`,
    );

  if (request.query.error) {
    clearPkceCookie(reply);
    return errorRedirect(request.query.error);
  }

  const { code, state } = request.query;
  if (!code || !state) {
    clearPkceCookie(reply);
    return reply.status(400).send({ error: "invalid_callback" });
  }

  const pkce = readPkceCookie(request);
  if (!pkce || pkce.state !== state) {
    clearPkceCookie(reply);
    request.log.warn("OAuth state mismatch or missing PKCE cookie");
    return reply.status(400).send({ error: "invalid_state" });
  }

  try {
    const profile = await exchangeCodeForProfile(code, pkce.codeVerifier);
    const user = await usersService.upsertByGoogleSub({
      googleSub: profile.sub,
      email: profile.email,
      emailVerified: profile.emailVerified,
      name: profile.name,
      pictureUrl: profile.pictureUrl,
    });
    const token = signSessionToken(user.id, user.email);
    clearPkceCookie(reply);
    setSessionCookie(reply, token);
    return reply.redirect(successRedirect);
  } catch (err) {
    clearPkceCookie(reply);
    request.log.error({ err }, "Google OAuth callback failed");
    return errorRedirect("oauth_failed");
  }
}

export function logout(_request: FastifyRequest, reply: FastifyReply): void {
  clearSessionCookie(reply);
  reply.status(204).send();
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user?.id;
  if (!userId) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const user = await usersService.findById(userId);
  if (!user) {
    clearSessionCookie(reply);
    return reply.status(401).send({ error: "unauthorized" });
  }
  return reply.send({ user: usersService.toPublicUser(user) });
}

export type { PkceCookiePayload };
