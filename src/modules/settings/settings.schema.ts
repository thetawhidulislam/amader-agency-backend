import { z } from "zod";
import { emptyToNull, nullableText } from "../../utils/zod";

export const updateSettingsSchema = z.object({
  phone: nullableText(30),
  email: z.preprocess(emptyToNull, z.string().trim().email().max(150).nullable().optional()),
  whatsapp: nullableText(30),
  address: nullableText(300),
  businessHours: nullableText(200),
  // e.g. { facebook: "https://...", instagram: "https://...", website: "https://..." }
  socials: z.record(z.string().max(300)).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
