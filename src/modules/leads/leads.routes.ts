import { Router } from "express";
import { leadLimiter } from "../../middlewares/rateLimit";
import { validate } from "../../middlewares/validate";
import * as controller from "./leads.controller";
import { adminLeadsQuerySchema, createLeadSchema, updateLeadStatusSchema } from "./leads.schema";

export const publicRoutes = Router();
publicRoutes.post("/", leadLimiter, validate({ body: createLeadSchema }), controller.create);

export const adminRoutes = Router();
adminRoutes.get("/", validate({ query: adminLeadsQuerySchema }), controller.listAdmin);
adminRoutes.get("/stats", controller.stats);
adminRoutes.get("/:id", controller.getById);
adminRoutes.patch("/:id/status", validate({ body: updateLeadStatusSchema }), controller.updateStatus);
adminRoutes.delete("/:id", controller.remove);
