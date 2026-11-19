import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { reorderSchema } from "../../utils/zod";
import * as controller from "./services.controller";
import { createServiceSchema, updateServiceSchema } from "./services.schema";

export const publicRoutes = Router();
publicRoutes.get("/", controller.listPublic);
publicRoutes.get("/:slug", controller.getPublicBySlug);

export const adminRoutes = Router();
adminRoutes.get("/", controller.listAdmin);
adminRoutes.post("/", validate({ body: createServiceSchema }), controller.create);
adminRoutes.patch("/reorder", validate({ body: reorderSchema }), controller.reorder);
adminRoutes.get("/:id", controller.getById);
adminRoutes.patch("/:id", validate({ body: updateServiceSchema }), controller.update);
adminRoutes.delete("/:id", controller.remove);
