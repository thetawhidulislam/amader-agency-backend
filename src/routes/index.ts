import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import { publicRoutes as leads } from "../modules/leads/leads.routes";
import { publicRoutes as portfolio } from "../modules/portfolio/portfolio.routes";
import { publicRoutes as services } from "../modules/services/services.routes";
import { publicRoutes as settings } from "../modules/settings/settings.routes";
import { publicRoutes as testimonials } from "../modules/testimonials/testimonials.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/services", services);
router.use("/portfolio", portfolio);
router.use("/leads", leads);
router.use("/settings", settings);
router.use("/testimonials", testimonials);
router.use("/admin", adminRoutes);

export default router;
