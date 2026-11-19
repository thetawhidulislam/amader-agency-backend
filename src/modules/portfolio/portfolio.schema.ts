import { z } from "zod";
import { nullableText, nullableUrl, paginationShape, slugSchema } from "../../utils/zod";

export const createPortfolioSchema = z.object({
  title: z.string().trim().min(2).max(150),
  slug: slugSchema.optional(),
  client: nullableText(120),
  cover: z.string().trim().url().max(500),
  gallery: z.array(z.string().trim().url().max(500)).max(30).default([]),
  videoUrl: nullableUrl,
  description: z.string().trim().min(10).max(10000),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  serviceId: z.string().min(1),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export const publicPortfolioQuerySchema = z.object({
  ...paginationShape,
  service: z.string().trim().min(1).optional(), // service slug
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const adminPortfolioQuerySchema = z.object({
  ...paginationShape,
  serviceId: z.string().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type PublicPortfolioQuery = z.infer<typeof publicPortfolioQuerySchema>;
export type AdminPortfolioQuery = z.infer<typeof adminPortfolioQuerySchema>;
