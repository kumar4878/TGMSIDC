import { Router, type IRouter } from "express";
import { eq, lte, and, gte } from "drizzle-orm";
import { db, rateContractsTable, equipmentTable, vendorsTable } from "@workspace/db";
import {
  CreateRateContractBody,
  UpdateRateContractBody,
  GetRateContractParams,
  UpdateRateContractParams,
  ListRateContractsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichRC(rc: typeof rateContractsTable.$inferSelect) {
  const [equip] = await db.select().from(equipmentTable).where(eq(equipmentTable.id, rc.equipmentId));
  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, rc.vendorId));
  return {
    ...rc,
    equipmentName: equip?.name ?? "Unknown",
    vendorName: vendor?.name ?? "Unknown",
    startDate: rc.startDate.toISOString(),
    endDate: rc.endDate.toISOString(),
    createdAt: rc.createdAt.toISOString(),
    updatedAt: rc.updatedAt.toISOString(),
  };
}

router.get("/rate-contracts/expiring-soon", async (_req, res): Promise<void> => {
  const sixtyDays = new Date();
  sixtyDays.setDate(sixtyDays.getDate() + 60);

  const rows = await db.select().from(rateContractsTable).where(
    and(
      eq(rateContractsTable.status, "active"),
      lte(rateContractsTable.endDate, sixtyDays),
      gte(rateContractsTable.endDate, new Date()),
    )
  );

  const enriched = await Promise.all(rows.map(enrichRC));
  res.json(enriched);
});

router.get("/rate-contracts", async (req, res): Promise<void> => {
  const query = ListRateContractsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db.select().from(rateContractsTable);
  const filtered = rows.filter((r) => {
    if (query.data.status && r.status !== query.data.status) return false;
    if (query.data.equipmentId != null && r.equipmentId !== query.data.equipmentId) return false;
    return true;
  });

  const enriched = await Promise.all(filtered.map(enrichRC));
  res.json(enriched);
});

router.post("/rate-contracts", async (req, res): Promise<void> => {
  const parsed = CreateRateContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const count = await db.select().from(rateContractsTable);
  const contractNumber = `RC-${new Date().getFullYear()}-${String(count.length + 1).padStart(4, "0")}`;

  const [rc] = await db.insert(rateContractsTable).values({
    ...parsed.data,
    contractNumber,
    startDate: new Date(parsed.data.startDate),
    endDate: new Date(parsed.data.endDate),
    status: "active",
  }).returning();

  res.status(201).json(await enrichRC(rc));
});

router.get("/rate-contracts/:id", async (req, res): Promise<void> => {
  const params = GetRateContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [rc] = await db.select().from(rateContractsTable).where(eq(rateContractsTable.id, params.data.id));
  if (!rc) {
    res.status(404).json({ error: "Rate contract not found" });
    return;
  }

  res.json(await enrichRC(rc));
});

router.patch("/rate-contracts/:id", async (req, res): Promise<void> => {
  const params = UpdateRateContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateRateContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.unitPrice != null) updateData.unitPrice = parsed.data.unitPrice;
  if (parsed.data.gstRate != null) updateData.gstRate = parsed.data.gstRate;
  if (parsed.data.status != null) updateData.status = parsed.data.status;
  if (parsed.data.endDate != null) updateData.endDate = new Date(parsed.data.endDate);
  if (parsed.data.cmcCharges != null) updateData.cmcCharges = parsed.data.cmcCharges;

  const [rc] = await db.update(rateContractsTable).set(updateData).where(eq(rateContractsTable.id, params.data.id)).returning();
  if (!rc) {
    res.status(404).json({ error: "Rate contract not found" });
    return;
  }

  res.json(await enrichRC(rc));
});

export default router;
