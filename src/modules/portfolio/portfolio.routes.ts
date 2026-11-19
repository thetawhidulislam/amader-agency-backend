import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { reorderSchema } from "../../utils/zod";
import * as controller from "./portfolio.controller";
import {
  adminPortfolioQuerySchema,
  createPortfolioSchema,
  publicPortfolioQuerySchema,
  updatePortfolioSchema,
} from "./portfolio.schema";

export const publicRoutes = Router();
publicRoutes.get("/", validate({ query: publicPortfolioQuerySchema }), controller.listPublic);
publicRoutes.get("/:slug", controller.getPublicBySlug);

export const adminRoutes = Router();
adminRoutes.get("/", validate({ query: adminPortfolioQuerySchema }), controller.listAdmin);
adminRoutes.post("/", validate({ body: createPortfolioSchema }), controller.create);
adminRoutes.patch("/reorder", validate({ body: reorderSchema }), controller.reorder);
adminRoutes.get("/:id", controller.getById);
adminRoutes.patch("/:id", validate({ body: updatePortfolioSchema }), controller.update);
adminRoutes.delete("/:id", controller.remove);
