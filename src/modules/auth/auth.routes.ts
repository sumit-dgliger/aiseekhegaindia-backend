import type { FastifyPluginAsync } from "fastify";
import rateLimit from "@fastify/rate-limit";
import * as controller from "./auth.controller.js";
import { requireAuth } from "../../plugins/requireAuth.js";

const authRoutes: FastifyPluginAsync = async (app) => {
  await app.register(rateLimit, {
    max: 20,
    timeWindow: "15 minutes",
  });

  app.get("/google", controller.googleStart);
  app.get("/google/callback", controller.googleCallback);
  app.get("/me", { preHandler: requireAuth }, controller.me);
  app.post("/logout", controller.logout);
};

export default authRoutes;
