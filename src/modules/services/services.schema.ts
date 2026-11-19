import { z } from "zod";
import { nullableText, slugSchema } from "../../utils/zod";

export const createServiceSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: slugSchema.optional(),
  icon: nullableText(60),
  shortDesc: z.string().trim().min(10).max(300),
  description: z.string().trim().min(10).max(10000),
  features: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  metaTitle: nullableText(160),
  metaDescription: nullableText(300),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
