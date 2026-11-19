import type { Lead, Prisma } from "@prisma/client";
import { env } from "../../config/env";
import { sendMail } from "../../config/mailer";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { escapeHtml } from "../../utils/escapeHtml";
import type { AdminLeadsQuery, CreateLeadInput } from "./leads.schema";

type LeadData = Omit<CreateLeadInput, "website">;

async function sendLeadEmails(lead: Lead, serviceTitle?: string) {
  try {
    if (env.LEAD_NOTIFY_EMAIL) {
      const row = (label: string, value?: string | null) =>
        `<tr><td style="padding:4px 12px 4px 0"><b>${label}</b></td><td>${escapeHtml(value || "-")}</td></tr>`;
      await sendMail({
        to: env.LEAD_NOTIFY_EMAIL,
        replyTo: lead.email ?? undefined,
        subject: `New lead: ${lead.name}${serviceTitle ? ` - ${serviceTitle}` : ""}`,
        html: `<h2>New lead received</h2>
<table>${row("Name", lead.name)}${row("Phone", lead.phone)}${row("Email", lead.email)}${row("Service", serviceTitle)}${row("Budget", lead.budget)}${row("Source", lead.source)}</table>
<p><b>Message</b></p><p>${escapeHtml(lead.message).replace(/\n/g, "<br/>")}</p>`,
      });
    }

    if (lead.email) {
      await sendMail({
        to: lead.email,
        subject: "We received your message - Amader Agency",
        html: `<p>Hi ${escapeHtml(lead.name)},</p>
<p>Thanks for contacting Amader Agency. We have received your message and our team will get back to you soon.</p>
<p>Amader Agency<br/>Your One-Stop Business Solution Partner</p>`,
      });
    }
  } catch (err) {
    console.error("[leads] email failed:", (err as Error).message);
  }
}

/* ---------- public ---------- */

export async function createLead(input: LeadData) {
  let service: { id: string; title: string } | null = null;

  if (input.serviceId) {
    service = await prisma.service.findFirst({
      where: { id: input.serviceId, isActive: true },
      select: { id: true, title: true },
    });
    if (!service) throw new ApiError(400, "Selected service is not available");
  }

  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      budget: input.budget,
      message: input.message,
      source: input.source,
      serviceId: service?.id,
    },
  });

  void sendLeadEmails(lead, service?.title);
  return { id: lead.id };
}

/* ---------- admin ---------- */

export async function listAdmin(q: AdminLeadsQuery) {
  const where: Prisma.LeadWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.serviceId ? { serviceId: q.serviceId } : {}),
    ...(q.search
      ? {
          OR: [
            { name: { contains: q.search, mode: "insensitive" } },
            { phone: { contains: q.search } },
            { email: { contains: q.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: { service: { select: { id: true, title: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    items,
    meta: { page: q.page, limit: q.limit, total, totalPages: Math.max(1, Math.ceil(total / q.limit)) },
  };
}

export async function stats() {
  const grouped = await prisma.lead.groupBy({ by: ["status"], _count: { _all: true } });
  const result = { NEW: 0, CONTACTED: 0, CLOSED: 0, total: 0 };
  for (const g of grouped) {
    result[g.status] = g._count._all;
    result.total += g._count._all;
  }
  return result;
}

export async function getById(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { service: { select: { id: true, title: true } } },
  });
  if (!lead) throw new ApiError(404, "Lead not found");
  return lead;
}

export async function updateStatus(id: string, status: Lead["status"]) {
  await getById(id);
  return prisma.lead.update({ where: { id }, data: { status } });
}

export async function remove(id: string) {
  await getById(id);
  await prisma.lead.delete({ where: { id } });
}
