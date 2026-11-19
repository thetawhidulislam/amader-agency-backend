import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";
import type { ReorderInput } from "../../utils/zod";
import type {
  AdminPortfolioQuery,
  CreatePortfolioInput,
  PublicPortfolioQuery,
  UpdatePortfolioInput,
} from "./portfolio.schema";

async function uniqueSlug(title: string) {
  const base = slugify(title) || "project";
  let slug = base;
  let i = 2;
  while (await prisma.portfolioItem.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

async function assertServiceExists(serviceId: string) {
  const exists = await prisma.service.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!exists) throw new ApiError(400, "Selected service does not exist");
}

const meta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

/* ---------- public ---------- */

export async function listPublic(q: PublicPortfolioQuery) {
  const where: Prisma.PortfolioItemWhereInput = {
    isActive: true,
    ...(q.service ? { service: { slug: q.service } } : {}),
    ...(q.featured !== undefined ? { featured: q.featured } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.portfolioItem.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      select: {
        id: true,
        title: true,
        slug: true,
        client: true,
        cover: true,
        tags: true,
        featured: true,
        service: { select: { title: true, slug: true } },
      },
    }),
    prisma.portfolioItem.count({ where }),
  ]);

  return { items, meta: meta(q.page, q.limit, total) };
}

export async function getPublicBySlug(slug: string) {
  const item = await prisma.portfolioItem.findFirst({
    where: { slug, isActive: true },
    include: { service: { select: { id: true, title: true, slug: true } } },
  });
  if (!item) throw new ApiError(404, "Portfolio item not found");
  return item;
}

/* ---------- admin ---------- */

export async function listAdmin(q: AdminPortfolioQuery) {
  const where: Prisma.PortfolioItemWhereInput = {
    ...(q.serviceId ? { serviceId: q.serviceId } : {}),
    ...(q.search
      ? {
          OR: [
            { title: { contains: q.search, mode: "insensitive" } },
            { client: { contains: q.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.portfolioItem.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: { service: { select: { id: true, title: true } } },
    }),
    prisma.portfolioItem.count({ where }),
  ]);

  return { items, meta: meta(q.page, q.limit, total) };
}

export async function getById(id: string) {
  const item = await prisma.portfolioItem.findUnique({
    where: { id },
    include: { service: { select: { id: true, title: true } } },
  });
  if (!item) throw new ApiError(404, "Portfolio item not found");
  return item;
}

export async function create(input: CreatePortfolioInput) {
  await assertServiceExists(input.serviceId);
  const slug = input.slug ?? (await uniqueSlug(input.title));
  return prisma.portfolioItem.create({ data: { ...input, slug } });
}

export async function update(id: string, input: UpdatePortfolioInput) {
  await getById(id);
  if (input.serviceId) await assertServiceExists(input.serviceId);
  return prisma.portfolioItem.update({ where: { id }, data: input });
}

export async function remove(id: string) {
  await getById(id);
  await prisma.portfolioItem.delete({ where: { id } });
}

export const reorder = (items: ReorderInput["items"]) =>
  prisma.$transaction(
    items.map((item) =>
      prisma.portfolioItem.update({
        where: { id: item.id },
        data: { order: item.order },
        select: { id: true },
      })
    )
  );
