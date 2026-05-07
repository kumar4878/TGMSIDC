import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, vendorsTable } from "@workspace/db";
import { CreateVendorBody, GetVendorParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/vendors", async (_req, res): Promise<void> => {
  const vendors = await db.select().from(vendorsTable).orderBy(vendorsTable.name);
  res.json(vendors.map((v) => ({
    ...v,
    performanceScore: v.performanceScore ?? null,
    createdAt: v.createdAt.toISOString(),
  })));
});

router.post("/vendors", async (req, res): Promise<void> => {
  const parsed = CreateVendorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const count = await db.select().from(vendorsTable);
  const vendorCode = `VND-${String(count.length + 1).padStart(4, "0")}`;

  const [vendor] = await db.insert(vendorsTable).values({
    ...parsed.data,
    vendorCode,
    contactPhone: parsed.data.contactPhone ?? "",
    status: "active",
  }).returning();

  res.status(201).json({ ...vendor, performanceScore: vendor.performanceScore ?? null, createdAt: vendor.createdAt.toISOString() });
});

router.get("/vendors/:id", async (req, res): Promise<void> => {
  const params = GetVendorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, params.data.id));
  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }

  res.json({ ...vendor, performanceScore: vendor.performanceScore ?? null, createdAt: vendor.createdAt.toISOString() });
});

export default router;
