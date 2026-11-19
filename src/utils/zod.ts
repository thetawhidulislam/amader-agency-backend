import { z } from "zod";

export const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

export const nullableText = (max: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional());

export const nullableUrl = z.preprocess(
  emptyToNull,
  z.string().trim().url().max(500).nullable().optional()
);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens");

export const paginationShape = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
};

export const reorderSchema = z.object({
  items: z
    .array(z.object({ id: z.string().min(1), order: z.number().int().min(0) }))
    .min(1)
    .max(200),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
