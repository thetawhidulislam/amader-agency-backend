import { z } from "zod";
import { nullableText } from "../../utils/zod";

export const createTestimonialSchema = z.object({
  name: z.string().trim().min(2).max(100),
  role: nullableText(120),
  text: z.string().trim().min(10).max(1500),
  isActive: z.boolean().default(false),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();
