import type { FastifyInstance } from "fastify";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, "request failed");

    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as { statusCode?: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 500;

    if (statusCode >= 500) {
      return reply.status(500).send({ error: "internal_error" });
    }

    const message =
      error instanceof Error ? error.message : "request_error";
    return reply.status(statusCode).send({ error: message });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ error: "not_found" });
  });
}
