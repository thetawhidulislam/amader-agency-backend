import { asyncHandler } from "../../utils/asyncHandler";
import type { AdminLeadsQuery } from "./leads.schema";
import * as service from "./leads.service";

const THANKS = "Thank you! We have received your message and will contact you soon.";

/* public */
export const create = asyncHandler(async (req, res) => {
  const { website, ...data } = req.body;

  // Honeypot filled => bot. Pretend success, save nothing.
  if (website && String(website).trim() !== "") {
    return void res.status(201).json({ success: true, message: THANKS });
  }

  await service.createLead(data);
  res.status(201).json({ success: true, message: THANKS });
});

/* admin */
export const listAdmin = asyncHandler(async (_req, res) => {
  const data = await service.listAdmin(res.locals.query as AdminLeadsQuery);
  res.json({ success: true, ...data });
});

export const stats = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await service.stats() });
});

export const getById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getById(req.params.id) });
});

export const updateStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.updateStatus(req.params.id, req.body.status) });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.json({ success: true, message: "Lead deleted" });
});
