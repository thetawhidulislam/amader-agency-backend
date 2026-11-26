import { asyncHandler } from "../../utils/asyncHandler";
import { runInBackground } from "../../utils/background";
import { revalidateFrontend } from "../../utils/revalidate";
import type { PublicTeamQuery } from "./team.schema";
import * as service from "./team.service";

const refresh = () => runInBackground(revalidateFrontend(["team"]));

export const listPublic = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await service.listPublic(res.locals.query as PublicTeamQuery) });
});

export const getPublicBySlug = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getPublicBySlug(req.params.slug) });
});

export const listAdmin = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await service.listAdmin() });
});

export const getById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getById(req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.body);
  refresh();
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  refresh();
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  refresh();
  res.json({ success: true, message: "Team member deleted" });
});

export const reorder = asyncHandler(async (req, res) => {
  await service.reorder(req.body.items);
  refresh();
  res.json({ success: true, message: "Order updated" });
});
