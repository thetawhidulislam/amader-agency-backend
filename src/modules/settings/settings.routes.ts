import { Router } from "express";
import { validate } from "../../middlewares/validate";
import * as controller from "./settings.controller";
import { updateSettingsSchema } from "./settings.schema";

export const publicRoutes = Router();
publicRoutes.get("/", controller.get);

export const adminRoutes = Router();
adminRoutes.get("/", controller.get);
adminRoutes.put("/", validate({ body: updateSettingsSchema }), controller.update);
