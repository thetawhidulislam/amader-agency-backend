import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";
import type { ReorderInput } from "../../utils/zod";
import type { CreateTeamInput, PublicTeamQuery, UpdateTeamInput } from "./team.schema";

async function uniqueSlug(name: string) {
  const base = slugify(name) || "member";
  let slug = base;
  let i = 2;
  while (await prisma.teamMember.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function backfillSlugs() {
  const members = await prisma.teamMember.findMany({
    where: { slug: null },
    select: { id: true, name: true },
  });
  for (const member of members) {
    await prisma.teamMember.update({
      where: { id: member.id },
      data: { slug: await uniqueSlug(member.name) },
      select: { id: true },
    });
  }
}

export async function listPublic({ home, limit }: PublicTeamQuery) {
  await backfillSlugs();
  return prisma.teamMember.findMany({
    where: { isActive: true, ...(home ? { showOnHome: true } : {}) },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    select: {
      id: true,
      name: true,
      slug: true,
      role: true,
      department: true,
      bio: true,
      photo: true,
      socials: true,
    },
  });
}

export async function listAdmin() {
  await backfillSlugs();
  return prisma.teamMember.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
}

export async function getById(id: string) {
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) throw new ApiError(404, "Team member not found");
  return member;
}

export async function getPublicBySlug(slug: string) {
  const member = await prisma.teamMember.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      role: true,
      department: true,
      bio: true,
      about: true,
      photo: true,
      skills: true,
      socials: true,
    },
  });
  if (!member) throw new ApiError(404, "Team member not found");
  return member;
}

export async function create(input: CreateTeamInput) {
  const { socials, ...data } = input;
  return prisma.teamMember.create({
    data: {
      ...data,
      slug: input.slug ?? (await uniqueSlug(input.name)),
      ...(socials !== undefined ? { socials: socials as Prisma.InputJsonValue } : {}),
    },
  });
}

export async function update(id: string, input: UpdateTeamInput) {
  const member = await getById(id);
  const { socials, ...data } = input;
  return prisma.teamMember.update({
    where: { id },
    data: {
      ...data,
      ...(!member.slug && input.slug === undefined
        ? { slug: await uniqueSlug(input.name ?? member.name) }
        : {}),
      ...(socials !== undefined ? { socials: socials as Prisma.InputJsonValue } : {}),
    },
  });
}

export async function remove(id: string) {
  await getById(id);
  await prisma.teamMember.delete({ where: { id } });
}

export const reorder = (items: ReorderInput["items"]) =>
  prisma.$transaction(
    items.map((item) =>
      prisma.teamMember.update({ where: { id: item.id }, data: { order: item.order }, select: { id: true } })
    )
  );
