import { Router } from "express";
import { upload } from "../../middlewares/upload";
import { validate } from "../../middlewares/validate";
import * as controller from "./upload.controller";

export const adminRoutes = Router();
adminRoutes.post("/image", upload.single("file"), controller.uploadImage);
adminRoutes.delete("/image", validate({ body: controller.deleteImageSchema }), controller.deleteImage);
