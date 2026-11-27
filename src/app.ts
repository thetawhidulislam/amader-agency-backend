import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middlewares/error";
import { globalLimiter } from "./middlewares/rateLimit";
import routes from "./routes";

export const app = express();

// Needed so rate limiting sees the real client IP behind Render/Railway/Vercel/Nginx.
app.set("trust proxy", 1);

const extraOrigins = (env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: [env.FRONTEND_URL, ...extraOrigins],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok", uptime: process.uptime() });
});

app.get("/", (_req, res) => {
  res.json({ success: true, name: "Amader Agency API" });
});

app.use("/api/v1", globalLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
