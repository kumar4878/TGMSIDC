import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, indentsTable, institutionsTable, equipmentTable, rateContractsTable } from "@workspace/db";
import {
  CreateIndentBody,
  UpdateIndentBody,
  ApproveIndentBody,
  RejectIndentBody,
  ListIndentsQueryParams,
  GetIndentParams,
  UpdateIndentParams,
  ApproveIndentParams,
  RejectIndentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function padNum(n: number, len = 4) {
  return String(n).padStart(len, "0");
}

router.get("/indents", async (req, res): Promise<void> => {
  const query = ListIndentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db.select().from(indentsTable).orderBy(desc(indentsTable.createdAt));
  const filtered = rows.filter((r) => {
    if (query.data.status && r.status !== query.data.status) return false;
    if (query.data.facilityId != null && r.facilityId !== query.data.facilityId) return false;
    return true;
  });

  const facilities = await db.select().from(institutionsTable);
  const equipmentList = await db.select().from(equipmentTable);
  const facilityMap = new Map(facilities.map((f) => [f.id, f.name]));
  const equipmentMap = new Map(equipmentList.map((e) => [e.id, e.name]));

  const result = filtered.map((r) => ({
    ...r,
    facilityName: facilityMap.get(r.facilityId) ?? "Unknown",
    equipmentName: equipmentMap.get(r.equipmentId) ?? "Unknown",
    procurementMode: r.procurementMode ?? null,
    rateContractId: r.rateContractId ?? null,
    tenderId: r.tenderId ?? null,
    rejectionReason: r.rejectionReason ?? null,
    approvedBy: r.approvedBy ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  res.json(result);
});

router.post("/indents", async (req, res): Promise<void> => {
  const parsed = CreateIndentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const count = await db.select().from(indentsTable);
  const indentNumber = `IND-${new Date().getFullYear()}-${padNum(count.length + 1)}`;

  const [indent] = await db.insert(indentsTable).values({
    ...parsed.data,
    indentNumber,
    status: "pending_approval",
  }).returning();

  const facility = await db.select().from(institutionsTable).where(eq(institutionsTable.id, indent.facilityId));
  const equipment = await db.select().from(equipmentTable).where(eq(equipmentTable.id, indent.equipmentId));

  res.status(201).json({
    ...indent,
    facilityName: facility[0]?.name ?? "Unknown",
    equipmentName: equipment[0]?.name ?? "Unknown",
    procurementMode: indent.procurementMode ?? null,
    rateContractId: indent.rateContractId ?? null,
    tenderId: indent.tenderId ?? null,
    rejectionReason: indent.rejectionReason ?? null,
    approvedBy: indent.approvedBy ?? null,
    createdAt: indent.createdAt.toISOString(),
    updatedAt: indent.updatedAt.toISOString(),
  });
});

router.get("/indents/:id", async (req, res): Promise<void> => {
  const params = GetIndentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [indent] = await db.select().from(indentsTable).where(eq(indentsTable.id, params.data.id));
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }

  const facility = await db.select().from(institutionsTable).where(eq(institutionsTable.id, indent.facilityId));
  const equipment = await db.select().from(equipmentTable).where(eq(equipmentTable.id, indent.equipmentId));

  res.json({
    ...indent,
    facilityName: facility[0]?.name ?? "Unknown",
    equipmentName: equipment[0]?.name ?? "Unknown",
    procurementMode: indent.procurementMode ?? null,
    rateContractId: indent.rateContractId ?? null,
    tenderId: indent.tenderId ?? null,
    rejectionReason: indent.rejectionReason ?? null,
    approvedBy: indent.approvedBy ?? null,
    createdAt: indent.createdAt.toISOString(),
    updatedAt: indent.updatedAt.toISOString(),
  });
});

router.patch("/indents/:id", async (req, res): Promise<void> => {
  const params = UpdateIndentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateIndentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.quantity != null) updateData.quantity = parsed.data.quantity;
  if (parsed.data.technicalRequirements != null) updateData.technicalRequirements = parsed.data.technicalRequirements;
  if (parsed.data.status != null) updateData.status = parsed.data.status;

  const [indent] = await db.update(indentsTable).set(updateData).where(eq(indentsTable.id, params.data.id)).returning();
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }

  const facility = await db.select().from(institutionsTable).where(eq(institutionsTable.id, indent.facilityId));
  const equipment = await db.select().from(equipmentTable).where(eq(equipmentTable.id, indent.equipmentId));

  res.json({
    ...indent,
    facilityName: facility[0]?.name ?? "Unknown",
    equipmentName: equipment[0]?.name ?? "Unknown",
    procurementMode: indent.procurementMode ?? null,
    rateContractId: indent.rateContractId ?? null,
    tenderId: indent.tenderId ?? null,
    rejectionReason: indent.rejectionReason ?? null,
    approvedBy: indent.approvedBy ?? null,
    createdAt: indent.createdAt.toISOString(),
    updatedAt: indent.updatedAt.toISOString(),
  });
});

router.post("/indents/:id/approve", async (req, res): Promise<void> => {
  const params = ApproveIndentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ApproveIndentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const newStatus = parsed.data.procurementMode === "rate_contract"
    ? (parsed.data.rateContractId ? "linked_to_rc" : "approved")
    : "tender_initiated";

  const updateData: Record<string, unknown> = {
    status: newStatus,
    procurementMode: parsed.data.procurementMode,
    approvedBy: parsed.data.approvedBy,
  };
  if (parsed.data.rateContractId != null) updateData.rateContractId = parsed.data.rateContractId;

  const [indent] = await db.update(indentsTable).set(updateData).where(eq(indentsTable.id, params.data.id)).returning();
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }

  const facility = await db.select().from(institutionsTable).where(eq(institutionsTable.id, indent.facilityId));
  const equipment = await db.select().from(equipmentTable).where(eq(equipmentTable.id, indent.equipmentId));

  res.json({
    ...indent,
    facilityName: facility[0]?.name ?? "Unknown",
    equipmentName: equipment[0]?.name ?? "Unknown",
    procurementMode: indent.procurementMode ?? null,
    rateContractId: indent.rateContractId ?? null,
    tenderId: indent.tenderId ?? null,
    rejectionReason: indent.rejectionReason ?? null,
    approvedBy: indent.approvedBy ?? null,
    createdAt: indent.createdAt.toISOString(),
    updatedAt: indent.updatedAt.toISOString(),
  });
});

router.post("/indents/:id/reject", async (req, res): Promise<void> => {
  const params = RejectIndentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = RejectIndentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [indent] = await db.update(indentsTable).set({
    status: "rejected",
    rejectionReason: parsed.data.rejectionReason,
  }).where(eq(indentsTable.id, params.data.id)).returning();
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }

  const facility = await db.select().from(institutionsTable).where(eq(institutionsTable.id, indent.facilityId));
  const equipment = await db.select().from(equipmentTable).where(eq(equipmentTable.id, indent.equipmentId));

  res.json({
    ...indent,
    facilityName: facility[0]?.name ?? "Unknown",
    equipmentName: equipment[0]?.name ?? "Unknown",
    procurementMode: indent.procurementMode ?? null,
    rateContractId: indent.rateContractId ?? null,
    tenderId: indent.tenderId ?? null,
    rejectionReason: indent.rejectionReason ?? null,
    approvedBy: indent.approvedBy ?? null,
    createdAt: indent.createdAt.toISOString(),
    updatedAt: indent.updatedAt.toISOString(),
  });
});

export default router;
