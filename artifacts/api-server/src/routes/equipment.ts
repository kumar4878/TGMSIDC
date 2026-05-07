import { Router, type IRouter } from "express";
import { db, equipmentTable } from "@workspace/db";
import { CreateEquipmentBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/equipment", async (_req, res): Promise<void> => {
  const rows = await db.select().from(equipmentTable).orderBy(equipmentTable.name);
  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/equipment", async (req, res): Promise<void> => {
  const parsed = CreateEquipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const count = await db.select().from(equipmentTable);
  const equipmentCode = `EQP-${String(count.length + 1).padStart(4, "0")}`;

  const [equip] = await db.insert(equipmentTable).values({
    ...parsed.data,
    equipmentCode,
    standardised: true,
  }).returning();

  res.status(201).json({ ...equip, createdAt: equip.createdAt.toISOString() });
});

export default router;
