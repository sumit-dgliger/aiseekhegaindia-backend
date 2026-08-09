import { buildApp } from "../src/app.ts";

async function main() {
  const app = await buildApp();
  await app.listen({ port: 4010, host: "127.0.0.1" });
  const h = await fetch("http://127.0.0.1:4010/health");
  const m = await fetch("http://127.0.0.1:4010/api/v1/meta");
  const me = await fetch("http://127.0.0.1:4010/api/v1/auth/me");
  const bad = await fetch(
    "http://127.0.0.1:4010/api/v1/auth/google/callback?code=x",
  );
  console.log("health", h.status, await h.json());
  console.log("meta", await m.json());
  console.log("me", me.status, await me.json());
  console.log("bad_callback", bad.status, await bad.json());
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
