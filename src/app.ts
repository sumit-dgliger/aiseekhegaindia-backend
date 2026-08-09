import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { registerErrorHandler } from "./plugins/errorHandler.js";

export async function buildApp() {
  const app = Fastify({
    logger:
      env.NODE_ENV === "development"
        ? {
            transport: {
              target: "pino-pretty",
              options: { colorize: true, translateTime: "HH:MM:ss" },
            },
          }
        : true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: env.corsOrigins,
    credentials: true,
  });

  await app.register(cookie);

  registerErrorHandler(app);

  app.get("/health", async () => ({
    ok: true,
    service: "aiseekhegaindia-backend",
    version: "0.1.0",
    time: new Date().toISOString(),
  }));

  app.get("/api/v1/meta", async () => ({
    name: "AISeekhegaIndia API",
    docsBasePath: "/docs",
    features: {
      progressSync: false,
      auth: true,
      search: false,
    },
    deferred: "See DEFERRED.md for secondary decisions",
  }));

  app.get<{ Params: { userId: string } }>(
    "/api/v1/progress/:userId",
    async (request, reply) => {
      return reply.status(501).send({
        error: "not_implemented",
        message: "Progress sync deferred — localStorage on front for now",
        userId: request.params.userId,
      });
    },
  );

  await app.register(authRoutes, { prefix: "/api/v1/auth" });

  return app;
}
