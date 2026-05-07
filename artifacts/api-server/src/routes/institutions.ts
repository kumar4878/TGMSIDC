import { Router, type IRouter } from "express";
import { db, institutionsTable } from "@workspace/db";
import { CreateInstitutionBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/institutions", async (_req, res): Promise<void> => {
  const rows = await db.select().from(institutionsTable).orderBy(institutionsTable.name);
  res.json(rows.map((r) => ({
    ...r,
    superintendentName: r.superintendentName ?? null,
    contactEmail: r.contactEmail ?? null,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/institutions", async (req, res): Promise<void> => {
  const parsed = CreateInstitutionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const count = await db.select().from(institutionsTable);
  const institutionCode = `INST-${String(count.length + 1).padStart(4, "0")}`;

  const [inst] = await db.insert(institutionsTable).values({
    ...parsed.data,
    institutionCode,
  }).returning();

  res.status(201).json({ ...inst, superintendentName: inst.superintendentName ?? null, contactEmail: inst.contactEmail ?? null, createdAt: inst.createdAt.toISOString() });
});

export default router;
