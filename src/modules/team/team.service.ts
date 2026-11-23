import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { ReorderInput } from "../../utils/zod";
import type { CreateTeamInput, PublicTeamQuery, UpdateTeamInput } from "./team.schema";

export const listPublic = ({ home, limit }: PublicTeamQuery) =>
  prisma.teamMember.findMany({
    where: { isActive: true, ...(home ? { showOnHome: true } : {}) },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    select: { id: true, name: true, role: true, department: true, bio: true, photo: true, socials: true },
  });

export const listAdmin = () =>
  prisma.teamMember.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });

export async function getById(id: string) {
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) throw new ApiError(404, "Team member not found");
  return member;
}

export async function create(input: CreateTeamInput) {
  const { socials, ...data } = input;
  return prisma.teamMember.create({
    data: {
      ...data,
      ...(socials !== undefined ? { socials: socials as Prisma.InputJsonValue } : {}),
    },
  });
}

export async function update(id: string, input: UpdateTeamInput) {
  await getById(id);
  const { socials, ...data } = input;
  return prisma.teamMember.update({
    where: { id },
    data: {
      ...data,
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
