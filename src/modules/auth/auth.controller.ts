import type { CookieOptions } from "express";
import { COOKIE_NAME } from "../../config/constants";
import { env, isProd } from "../../config/env";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";

const baseCookie: CookieOptions = {
  httpOnly: true,
  secure: isProd || env.COOKIE_SAMESITE === "none",
  sameSite: env.COOKIE_SAMESITE,
  domain: env.COOKIE_DOMAIN,
  path: "/",
};

export const login = asyncHandler(async (req, res) => {
  const { token, admin } = await authService.login(req.body.email, req.body.password);
  res.cookie(COOKIE_NAME, token, {
    ...baseCookie,
    maxAge: env.JWT_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
  res.json({ success: true, data: admin });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(COOKIE_NAME, baseCookie);
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  const admin = await authService.getMe(req.admin!.id);
  res.json({ success: true, data: admin });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.admin!.id, req.body.currentPassword, req.body.newPassword);
  res.json({ success: true, message: "Password updated" });
});
