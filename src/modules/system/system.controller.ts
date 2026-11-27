import type { RequestHandler } from "express";
import { dbHost } from "../../config/database";
import { env } from "../../config/env";

export const getSystem: RequestHandler = (_req, res) => {
  res.json({
    success: true,
    data: {
      mode: env.DB_LABEL,
      dbHost,
      nodeEnv: env.NODE_ENV,
    },
  });
};
