import { Router } from "express";
import { requireAdmin } from "../../middlewares/auth";
import { authLimiter } from "../../middlewares/rateLimit";
import { validate } from "../../middlewares/validate";
import * as controller from "./auth.controller";
import { changePasswordSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/login", authLimiter, validate({ body: loginSchema }), controller.login);
router.post("/logout", controller.logout);
router.get("/me", requireAdmin, controller.me);
router.patch(
  "/password",
  requireAdmin,
  validate({ body: changePasswordSchema }),
  controller.changePassword
);

export default router;
