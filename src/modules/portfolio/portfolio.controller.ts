import { asyncHandler } from "../../utils/asyncHandler";
import { revalidateFrontend } from "../../utils/revalidate";
import type { AdminPortfolioQuery, PublicPortfolioQuery } from "./portfolio.schema";
import * as service from "./portfolio.service";

const refresh = () => void revalidateFrontend(["portfolio", "services"]);

/* public */
export const listPublic = asyncHandler(async (_req, res) => {
  const data = await service.listPublic(res.locals.query as PublicPortfolioQuery);
  res.json({ success: true, ...data });
});

export const getPublicBySlug = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getPublicBySlug(req.params.slug) });
});

/* admin */
export const listAdmin = asyncHandler(async (_req, res) => {
  const data = await service.listAdmin(res.locals.query as AdminPortfolioQuery);
  res.json({ success: true, ...data });
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
  res.json({ success: true, message: "Portfolio item deleted" });
});

export const reorder = asyncHandler(async (req, res) => {
  await service.reorder(req.body.items);
  refresh();
  res.json({ success: true, message: "Order updated" });
});
