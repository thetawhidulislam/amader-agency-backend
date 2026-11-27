import { Router } from "express";
import * as controller from "./system.controller";

export const adminRoutes = Router();
adminRoutes.get("/", controller.getSystem);
