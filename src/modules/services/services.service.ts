import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";
import type { ReorderInput } from "../../utils/zod";
import type { CreateServiceInput, UpdateServiceInput } from "./services.schema";

async function uniqueSlug(title: string) {
  const base = slugify(title) || "service";
  let slug = base;
  let i = 2;
  while (await prisma.service.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

/* ---------- public ---------- */

export const listPublic = () =>
  prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, slug: true, icon: true, shortDesc: true, features: true, order: true },
  });

export async function getPublicBySlug(slug: string) {
  const service = await prisma.service.findFirst({
    where: { slug, isActive: true },
    include: {
      portfolio: {
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 6,
        select: { id: true, title: true, slug: true, cover: true, client: true, tags: true },
      },
    },
  });
  if (!service) throw new ApiError(404, "Service not found");
  return service;
}

/* ---------- admin ---------- */

export const listAdmin = () =>
  prisma.service.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { portfolio: true, leads: true } } },
  });

export async function getById(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new ApiError(404, "Service not found");
  return service;
}

export async function create(input: CreateServiceInput) {
  const slug = input.slug ?? (await uniqueSlug(input.title));
  return prisma.service.create({ data: { ...input, slug } });
}

export async function update(id: string, input: UpdateServiceInput) {
  await getById(id);
  return prisma.service.update({ where: { id }, data: input });
}

export async function remove(id: string) {
  await getById(id);
  const portfolioCount = await prisma.portfolioItem.count({ where: { serviceId: id } });
  if (portfolioCount > 0) {
    throw new ApiError(
      409,
      `This service has ${portfolioCount} portfolio item(s). Move or delete them first, or deactivate the service instead.`
    );
  }
  await prisma.service.delete({ where: { id } });
}

export const reorder = (items: ReorderInput["items"]) =>
  prisma.$transaction(
    items.map((item) =>
      prisma.service.update({ where: { id: item.id }, data: { order: item.order }, select: { id: true } })
    )
  );
