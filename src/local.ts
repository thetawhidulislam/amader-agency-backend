import app from "./app";
import { dbHost } from "./config/database";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function bootstrap() {
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    console.log(
      `API running on http://localhost:${env.PORT} mode=${env.DB_LABEL} dbHost=${dbHost} FRONTEND_URL=${env.FRONTEND_URL}`
    );
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
