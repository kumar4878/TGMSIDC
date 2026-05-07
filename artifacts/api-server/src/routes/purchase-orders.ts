import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, purchaseOrdersTable, vendorsTable, equipmentTable, rateContractsTable, indentsTable } from "@workspace/db";
import {
  CreatePurchaseOrderBody,
  UpdatePurchaseOrderBody,
  GetPurchaseOrderParams,
  UpdatePurchaseOrderParams,
  ApprovePurchaseOrderParams,
  CancelPurchaseOrderParams,
  CancelPurchaseOrderBody,
  ListPurchaseOrdersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichPO(po: typeof purchaseOrdersTable.$inferSelect) {
  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, po.vendorId));
  const [equip] = await db.select().from(equipmentTable).where(eq(equipmentTable.id, po.equipmentId));
  return {
    ...po,
    vendorName: vendor?.name ?? "Unknown",
    equipmentName: equip?.name ?? "Unknown",
    expectedDeliveryDate: po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString() : null,
    actualDeliveryDate: po.actualDeliveryDate ? po.actualDeliveryDate.toISOString() : null,
    cancellationReason: po.cancellationReason ?? null,
    createdAt: po.createdAt.toISOString(),
    updatedAt: po.updatedAt.toISOString(),
  };
}

router.get("/purchase-orders", async (req, res): Promise<void> => {
  const query = ListPurchaseOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db.select().from(purchaseOrdersTable);
  const filtered = rows.filter((r) => {
    if (query.data.status && r.status !== query.data.status) return false;
    if (query.data.vendorId != null && r.vendorId !== query.data.vendorId) return false;
    return true;
  });

  const enriched = await Promise.all(filtered.map(enrichPO));
  res.json(enriched);
});

router.post("/purchase-orders", async (req, res): Promise<void> => {
  const parsed = CreatePurchaseOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [rc] = await db.select().from(rateContractsTable).where(eq(rateContractsTable.id, parsed.data.rateContractId));
  if (!rc) {
    res.status(404).json({ error: "Rate contract not found" });
    return;
  }

  const [indent] = await db.select().from(indentsTable).where(eq(indentsTable.id, parsed.data.indentId));
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }

  const count = await db.select().from(purchaseOrdersTable);
  const poNumber = `PO-${new Date().getFullYear()}-${String(count.length + 1).padStart(5, "0")}`;

  const totalAmount = rc.unitPrice * parsed.data.quantity * (1 + rc.gstRate / 100);

  const [po] = await db.insert(purchaseOrdersTable).values({
    poNumber,
    indentId: parsed.data.indentId,
    rateContractId: parsed.data.rateContractId,
    vendorId: rc.vendorId,
    equipmentId: rc.equipmentId,
    quantity: parsed.data.quantity,
    unitPrice: rc.unitPrice,
    gstRate: rc.gstRate,
    totalAmount,
    status: "draft",
    deliveryAddress: parsed.data.deliveryAddress,
    expectedDeliveryDate: parsed.data.expectedDeliveryDate ? new Date(parsed.data.expectedDeliveryDate) : null,
  }).returning();

  await db.update(indentsTable).set({ status: "po_issued" }).where(eq(indentsTable.id, parsed.data.indentId));

  res.status(201).json(await enrichPO(po));
});

router.get("/purchase-orders/:id", async (req, res): Promise<void> => {
  const params = GetPurchaseOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [po] = await db.select().from(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, params.data.id));
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }

  res.json(await enrichPO(po));
});

router.patch("/purchase-orders/:id", async (req, res): Promise<void> => {
  const params = UpdatePurchaseOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePurchaseOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.quantity != null) updateData.quantity = parsed.data.quantity;
  if (parsed.data.deliveryAddress != null) updateData.deliveryAddress = parsed.data.deliveryAddress;
  if (parsed.data.expectedDeliveryDate != null) updateData.expectedDeliveryDate = new Date(parsed.data.expectedDeliveryDate);
  if (parsed.data.status != null) updateData.status = parsed.data.status;

  const [po] = await db.update(purchaseOrdersTable).set(updateData).where(eq(purchaseOrdersTable.id, params.data.id)).returning();
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }

  res.json(await enrichPO(po));
});

router.post("/purchase-orders/:id/approve", async (req, res): Promise<void> => {
  const params = ApprovePurchaseOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [po] = await db.update(purchaseOrdersTable).set({ status: "approved" }).where(eq(purchaseOrdersTable.id, params.data.id)).returning();
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }

  res.json(await enrichPO(po));
});

router.post("/purchase-orders/:id/cancel", async (req, res): Promise<void> => {
  const params = CancelPurchaseOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CancelPurchaseOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [po] = await db.update(purchaseOrdersTable).set({
    status: "cancelled",
    cancellationReason: parsed.data.cancellationReason,
    cancelledBy: parsed.data.cancelledBy,
  }).where(eq(purchaseOrdersTable.id, params.data.id)).returning();
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }

  res.json(await enrichPO(po));
});

export default router;
