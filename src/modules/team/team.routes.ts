import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { reorderSchema } from "../../utils/zod";
import * as controller from "./team.controller";
import { createTeamSchema, publicTeamQuerySchema, updateTeamSchema } from "./team.schema";

export const publicRoutes = Router();
publicRoutes.get("/", validate({ query: publicTeamQuerySchema }), controller.listPublic);
publicRoutes.get("/:slug", controller.getPublicBySlug);

export const adminRoutes = Router();
adminRoutes.get("/", controller.listAdmin);
adminRoutes.post("/", validate({ body: createTeamSchema }), controller.create);
adminRoutes.patch("/reorder", validate({ body: reorderSchema }), controller.reorder);
adminRoutes.get("/:id", controller.getById);
adminRoutes.patch("/:id", validate({ body: updateTeamSchema }), controller.update);
adminRoutes.delete("/:id", controller.remove);
