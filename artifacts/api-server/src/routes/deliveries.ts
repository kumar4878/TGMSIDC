import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, deliveriesTable, purchaseOrdersTable, vendorsTable, institutionsTable, equipmentTable } from "@workspace/db";
import {
  CreateDeliveryBody,
  UpdateDeliveryBody,
  GetDeliveryParams,
  UpdateDeliveryParams,
  AcceptDeliveryParams,
  ListDeliveriesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateQR() {
  return `QR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function enrichDelivery(d: typeof deliveriesTable.$inferSelect) {
  const [po] = await db.select().from(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, d.purchaseOrderId));
  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, d.vendorId));
  const [facility] = await db.select().from(institutionsTable).where(eq(institutionsTable.id, d.facilityId));
  const equipmentName = po
    ? (await db.select().from(equipmentTable).where(eq(equipmentTable.id, po.equipmentId)))[0]?.name ?? "Unknown"
    : "Unknown";

  return {
    ...d,
    poNumber: po?.poNumber ?? "Unknown",
    vendorName: vendor?.name ?? "Unknown",
    facilityName: facility?.name ?? "Unknown",
    equipmentName,
    dispatchDate: d.dispatchDate ? d.dispatchDate.toISOString() : null,
    deliveredDate: d.deliveredDate ? d.deliveredDate.toISOString() : null,
    qaComplianceScore: d.qaComplianceScore ?? null,
    qaNotes: d.qaNotes ?? null,
    discrepancyNotes: d.discrepancyNotes ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

router.get("/deliveries", async (req, res): Promise<void> => {
  const query = ListDeliveriesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db.select().from(deliveriesTable);
  const filtered = rows.filter((r) => {
    if (query.data.status && r.status !== query.data.status) return false;
    if (query.data.poId != null && r.purchaseOrderId !== query.data.poId) return false;
    return true;
  });

  const enriched = await Promise.all(filtered.map(enrichDelivery));
  res.json(enriched);
});

router.post("/deliveries", async (req, res): Promise<void> => {
  const parsed = CreateDeliveryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [po] = await db.select().from(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, parsed.data.purchaseOrderId));
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }

  const [delivery] = await db.insert(deliveriesTable).values({
    qrCode: generateQR(),
    purchaseOrderId: parsed.data.purchaseOrderId,
    vendorId: po.vendorId,
    facilityId: parsed.data.facilityId,
    quantity: parsed.data.quantity,
    status: "dispatched",
    dispatchDate: new Date(parsed.data.dispatchDate),
    documentsUploaded: false,
    acceptanceCertificateIssued: false,
  }).returning();

  await db.update(purchaseOrdersTable).set({ status: "dispatched" }).where(eq(purchaseOrdersTable.id, parsed.data.purchaseOrderId));

  res.status(201).json(await enrichDelivery(delivery));
});

router.get("/deliveries/:id", async (req, res): Promise<void> => {
  const params = GetDeliveryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [delivery] = await db.select().from(deliveriesTable).where(eq(deliveriesTable.id, params.data.id));
  if (!delivery) {
    res.status(404).json({ error: "Delivery not found" });
    return;
  }

  res.json(await enrichDelivery(delivery));
});

router.patch("/deliveries/:id", async (req, res): Promise<void> => {
  const params = UpdateDeliveryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDeliveryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status != null) updateData.status = parsed.data.status;
  if (parsed.data.deliveredDate != null) updateData.deliveredDate = new Date(parsed.data.deliveredDate);
  if (parsed.data.qaComplianceScore != null) updateData.qaComplianceScore = parsed.data.qaComplianceScore;
  if (parsed.data.qaNotes != null) updateData.qaNotes = parsed.data.qaNotes;
  if (parsed.data.discrepancyNotes != null) updateData.discrepancyNotes = parsed.data.discrepancyNotes;
  if (parsed.data.documentsUploaded != null) updateData.documentsUploaded = parsed.data.documentsUploaded;

  const [delivery] = await db.update(deliveriesTable).set(updateData).where(eq(deliveriesTable.id, params.data.id)).returning();
  if (!delivery) {
    res.status(404).json({ error: "Delivery not found" });
    return;
  }

  res.json(await enrichDelivery(delivery));
});

router.post("/deliveries/:id/accept", async (req, res): Promise<void> => {
  const params = AcceptDeliveryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [current] = await db.select().from(deliveriesTable).where(eq(deliveriesTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Delivery not found" });
    return;
  }

  if (current.qaComplianceScore == null || current.qaComplianceScore < 100) {
    res.status(400).json({ error: "QA compliance must be 100% before acceptance" });
    return;
  }

  if (!current.documentsUploaded) {
    res.status(400).json({ error: "All documents must be uploaded before acceptance" });
    return;
  }

  const [delivery] = await db.update(deliveriesTable).set({
    status: "accepted",
    acceptanceCertificateIssued: true,
  }).where(eq(deliveriesTable.id, params.data.id)).returning();

  await db.update(purchaseOrdersTable).set({ status: "delivered", actualDeliveryDate: new Date() }).where(eq(purchaseOrdersTable.id, delivery.purchaseOrderId));

  res.json(await enrichDelivery(delivery));
});

export default router;
