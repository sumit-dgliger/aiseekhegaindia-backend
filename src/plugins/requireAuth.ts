import type { FastifyReply, FastifyRequest } from "fastify";
import {
  ASID_COOKIE,
  verifySessionToken,
} from "../modules/auth/session.js";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = request.cookies[ASID_COOKIE];
  if (!token) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  try {
    const claims = verifySessionToken(token);
    request.user = { id: claims.sub, email: claims.email };
  } catch {
    return reply.status(401).send({ error: "unauthorized" });
  }
}
