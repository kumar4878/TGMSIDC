import { Router } from "express";
import { Equipment } from "../models/Equipment.js";

const router = Router();

function formatEquipment(e: any) {
  return {
    id: e._id.toString(),
    equipmentCode: e.equipmentCode,
    name: e.name,
    category: e.category,
    specifications: e.specifications,
    gstRate: e.gstRate,
    standardised: e.standardised,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/equipment", async (_req, res): Promise<void> => {
  const rows = await Equipment.find().sort({ name: 1 });
  res.json(rows.map(formatEquipment));
});

router.post("/equipment", async (req, res): Promise<void> => {
  const { name, category, specifications, gstRate } = req.body;
  if (!name || !category || !specifications) {
    res.status(400).json({ error: "name, category, specifications are required" });
    return;
  }

  const count = await Equipment.countDocuments();
  const equipmentCode = `EQP-${String(count + 1).padStart(4, "0")}`;

  const equip = await Equipment.create({
    equipmentCode,
    name,
    category,
    specifications,
    gstRate: gstRate ?? 12,
    standardised: true,
  });

  res.status(201).json(formatEquipment(equip));
});

export default router;
