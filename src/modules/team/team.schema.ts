import { z } from "zod";
import { nullableText, nullableUrl } from "../../utils/zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(100),
  department: nullableText(100),
  bio: nullableText(400),
  photo: nullableUrl,
  socials: z.record(z.string().url().max(300)).optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  showOnHome: z.boolean().default(true),
});

export const updateTeamSchema = createTeamSchema.partial();

export const publicTeamQuerySchema = z.object({
  home: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type PublicTeamQuery = z.infer<typeof publicTeamQuerySchema>;
