import { Router } from "express";
import { validate } from "../../middlewares/validate";
import * as controller from "./testimonials.controller";
import { createTestimonialSchema, updateTestimonialSchema } from "./testimonials.schema";

export const publicRoutes = Router();
publicRoutes.get("/", controller.listPublic);

export const adminRoutes = Router();
adminRoutes.get("/", controller.listAdmin);
adminRoutes.post("/", validate({ body: createTestimonialSchema }), controller.create);
adminRoutes.patch("/:id", validate({ body: updateTestimonialSchema }), controller.update);
adminRoutes.delete("/:id", controller.remove);
