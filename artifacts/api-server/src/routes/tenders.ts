import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tendersTable, indentsTable, equipmentTable } from "@workspace/db";
import {
  CreateTenderBody,
  UpdateTenderBody,
  GetTenderParams,
  UpdateTenderParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichTender(t: typeof tendersTable.$inferSelect) {
  const [indent] = await db.select().from(indentsTable).where(eq(indentsTable.id, t.indentId));
  const equipmentName = indent
    ? (await db.select().from(equipmentTable).where(eq(equipmentTable.id, indent.equipmentId)))[0]?.name ?? "Unknown"
    : "Unknown";

  return {
    ...t,
    equipmentName,
    tenderInvitedDate: t.tenderInvitedDate ? t.tenderInvitedDate.toISOString() : null,
    bidsReceivedDate: t.bidsReceivedDate ? t.bidsReceivedDate.toISOString() : null,
    l1BidderName: t.l1BidderName ?? null,
    l1BidderAmount: t.l1BidderAmount ?? null,
    notes: t.notes ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

router.get("/tenders", async (_req, res): Promise<void> => {
  const rows = await db.select().from(tendersTable);
  const enriched = await Promise.all(rows.map(enrichTender));
  res.json(enriched);
});

router.post("/tenders", async (req, res): Promise<void> => {
  const parsed = CreateTenderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const count = await db.select().from(tendersTable);
  const tenderNumber = `TND-${new Date().getFullYear()}-${String(count.length + 1).padStart(4, "0")}`;

  const [tender] = await db.insert(tendersTable).values({
    tenderNumber,
    indentId: parsed.data.indentId,
    status: "invited",
    tenderInvitedDate: new Date(parsed.data.tenderInvitedDate),
    notes: parsed.data.notes,
  }).returning();

  await db.update(indentsTable).set({ status: "tender_initiated", tenderId: tender.id }).where(eq(indentsTable.id, parsed.data.indentId));

  res.status(201).json(await enrichTender(tender));
});

router.get("/tenders/:id", async (req, res): Promise<void> => {
  const params = GetTenderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tender] = await db.select().from(tendersTable).where(eq(tendersTable.id, params.data.id));
  if (!tender) {
    res.status(404).json({ error: "Tender not found" });
    return;
  }

  res.json(await enrichTender(tender));
});

router.patch("/tenders/:id", async (req, res): Promise<void> => {
  const params = UpdateTenderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTenderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status != null) updateData.status = parsed.data.status;
  if (parsed.data.bidsReceivedDate != null) updateData.bidsReceivedDate = new Date(parsed.data.bidsReceivedDate);
  if (parsed.data.l1BidderName != null) updateData.l1BidderName = parsed.data.l1BidderName;
  if (parsed.data.l1BidderAmount != null) updateData.l1BidderAmount = parsed.data.l1BidderAmount;
  if (parsed.data.notes != null) updateData.notes = parsed.data.notes;

  const [tender] = await db.update(tendersTable).set(updateData).where(eq(tendersTable.id, params.data.id)).returning();
  if (!tender) {
    res.status(404).json({ error: "Tender not found" });
    return;
  }

  res.json(await enrichTender(tender));
});

export default router;
