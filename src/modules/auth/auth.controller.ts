import type { FastifyReply, FastifyRequest } from "fastify";
import * as authService from "./auth.service.js";

export async function googleStart(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  authService.startGoogleOAuth(reply);
}

export async function googleCallback(
  request: FastifyRequest<{
    Querystring: { code?: string; state?: string; error?: string };
  }>,
  reply: FastifyReply,
) {
  await authService.handleGoogleCallback(request, reply);
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  return authService.getMe(request, reply);
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  authService.logout(request, reply);
}
