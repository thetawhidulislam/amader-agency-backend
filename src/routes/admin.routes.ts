import { Router } from "express";
import { requireAdmin } from "../middlewares/auth";
import { adminRoutes as leads } from "../modules/leads/leads.routes";
import { adminRoutes as portfolio } from "../modules/portfolio/portfolio.routes";
import { adminRoutes as services } from "../modules/services/services.routes";
import { adminRoutes as settings } from "../modules/settings/settings.routes";
import { adminRoutes as testimonials } from "../modules/testimonials/testimonials.routes";
import { adminRoutes as upload } from "../modules/upload/upload.routes";

const router = Router();

router.use(requireAdmin); // everything below needs a logged-in admin

router.use("/services", services);
router.use("/portfolio", portfolio);
router.use("/leads", leads);
router.use("/testimonials", testimonials);
router.use("/settings", settings);
router.use("/upload", upload);

export default router;
