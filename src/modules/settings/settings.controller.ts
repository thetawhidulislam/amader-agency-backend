import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { revalidateFrontend } from "../../utils/revalidate";
import type { UpdateSettingsInput } from "./settings.schema";

const emptySettings = {
  id: 1,
  phone: null,
  email: null,
  whatsapp: null,
  address: null,
  businessHours: null,
  socials: null,
};

export const get = asyncHandler(async (_req, res) => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  res.json({ success: true, data: settings ?? emptySettings });
});

export const update = asyncHandler(async (req, res) => {
  const { socials, ...rest } = req.body as UpdateSettingsInput;
  const data = {
    ...rest,
    ...(socials ? { socials: socials as Prisma.InputJsonValue } : {}),
  };

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  void revalidateFrontend(["settings"]);
  res.json({ success: true, data: settings });
});
