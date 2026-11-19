import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Validates req.body (replaced with parsed value) and req.query
 * (parsed value is available as res.locals.query).
 */
export const validate =
  (schemas: { body?: ZodTypeAny; query?: ZodTypeAny }): RequestHandler =>
  (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) res.locals.query = schemas.query.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
