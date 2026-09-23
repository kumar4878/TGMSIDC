import { Router } from "express";
import { Tender } from "../models/Tender.js";
import { Indent } from "../models/Indent.js";
import { Equipment } from "../models/Equipment.js";

const router = Router();

async function enrichTender(t: any) {
  let equipmentName = t.equipmentName ?? null;

  if (!equipmentName && t.indentId) {
    const indent = await Indent.findById(t.indentId);
    if (indent) {
      const equip = await Equipment.findById(indent.equipmentId);
      equipmentName = equip?.name ?? "Unknown";
    }
  }

  return {
    id: t._id.toString(),
    tenderNumber: t.tenderNumber,
    indentId: t.indentId?.toString() ?? null,
    equipmentName: equipmentName ?? "Unknown",
    status: t.status,
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
  const rows = await Tender.find().sort({ createdAt: -1 });
  const enriched = await Promise.all(rows.map(enrichTender));
  res.json(enriched);
});

router.post("/tenders", async (req, res): Promise<void> => {
  const { indentId, tenderInvitedDate, notes, equipmentName } = req.body;
  if (!tenderInvitedDate) {
    res.status(400).json({ error: "tenderInvitedDate is required" });
    return;
  }

  const count = await Tender.countDocuments();
  const tenderNumber = `TND-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const hasBoundIndent = indentId && indentId !== "0";

  const tender = await Tender.create({
    tenderNumber,
    indentId: hasBoundIndent ? indentId : undefined,
    equipmentName: equipmentName ?? undefined,
    status: "invited",
    tenderInvitedDate: new Date(tenderInvitedDate),
    notes,
  });

  if (hasBoundIndent) {
    await Indent.findByIdAndUpdate(indentId, { status: "tender_initiated", tenderId: tender._id });
  }

  res.status(201).json(await enrichTender(tender));
});

router.get("/tenders/:id", async (req, res): Promise<void> => {
  const tender = await Tender.findById(req.params.id);
  if (!tender) {
    res.status(404).json({ error: "Tender not found" });
    return;
  }
  res.json(await enrichTender(tender));
});

router.patch("/tenders/:id", async (req, res): Promise<void> => {
  const { status, bidsReceivedDate, l1BidderName, l1BidderAmount, notes } = req.body;
  const update: Record<string, any> = {};
  if (status != null) update.status = status;
  if (bidsReceivedDate != null) update.bidsReceivedDate = new Date(bidsReceivedDate);
  if (l1BidderName != null) update.l1BidderName = l1BidderName;
  if (l1BidderAmount != null) update.l1BidderAmount = l1BidderAmount;
  if (notes != null) update.notes = notes;

  const tender = await Tender.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!tender) {
    res.status(404).json({ error: "Tender not found" });
    return;
  }
  res.json(await enrichTender(tender));
});

export default router;
