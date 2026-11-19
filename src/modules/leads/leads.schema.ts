import { LeadStatus } from "@prisma/client";
import { z } from "zod";
import { paginationShape } from "../../utils/zod";

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,20}$/, "Please enter a valid phone number"),
  email: z.preprocess(emptyToUndefined, z.string().trim().toLowerCase().email().max(150).optional()),
  serviceId: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  budget: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
  source: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  // Honeypot: real users never see or fill this field.
  website: z.string().max(200).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
});

export const adminLeadsQuerySchema = z.object({
  ...paginationShape,
  status: z.nativeEnum(LeadStatus).optional(),
  serviceId: z.string().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type AdminLeadsQuery = z.infer<typeof adminLeadsQuerySchema>;
