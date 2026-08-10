import { buildApp } from "./app.js";

async function main() {
  const app = await buildApp();
  // Cloud Run always expects 8080; never fall back to a local-dev default.
  const port = Number.parseInt(process.env.PORT || "8080", 10);
  if (!Number.isFinite(port) || port <= 0) {
    console.error(`Invalid PORT: ${process.env.PORT}`);
    process.exit(1);
  }
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info({ port }, "server listening");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
