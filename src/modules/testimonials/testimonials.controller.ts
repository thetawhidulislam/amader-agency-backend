import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { revalidateFrontend } from "../../utils/revalidate";

const refresh = () => void revalidateFrontend(["testimonials"]);

/* public */
export const listPublic = asyncHandler(async (_req, res) => {
  const data = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, role: true, text: true },
  });
  res.json({ success: true, data });
});

/* admin */
export const listAdmin = asyncHandler(async (_req, res) => {
  const data = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await prisma.testimonial.create({ data: req.body });
  refresh();
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const exists = await prisma.testimonial.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!exists) throw new ApiError(404, "Testimonial not found");
  const data = await prisma.testimonial.update({ where: { id: req.params.id }, data: req.body });
  refresh();
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  const exists = await prisma.testimonial.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!exists) throw new ApiError(404, "Testimonial not found");
  await prisma.testimonial.delete({ where: { id: req.params.id } });
  refresh();
  res.json({ success: true, message: "Testimonial deleted" });
});
