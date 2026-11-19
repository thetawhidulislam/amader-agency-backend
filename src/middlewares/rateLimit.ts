import rateLimit from "express-rate-limit";

const base = { standardHeaders: true, legacyHeaders: false } as const;

const message = (text: string) => ({ success: false, message: text });

export const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: message("Too many requests, please try again later."),
});

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: message("Too many login attempts, please try again in 15 minutes."),
});

export const leadLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: message("Too many submissions, please try again later."),
});
