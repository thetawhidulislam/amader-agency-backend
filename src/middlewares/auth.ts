import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "../config/constants";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface AuthPayload {
  id: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AuthPayload;
    }
  }
}

export const requireAdmin: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = (req.cookies?.[COOKIE_NAME] as string | undefined) ?? bearer;

  if (!token) return next(new ApiError(401, "Authentication required"));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as unknown as AuthPayload;
    if (!payload?.id) throw new Error("Malformed token");
    req.admin = { id: payload.id, email: payload.email };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired session"));
  }
};
