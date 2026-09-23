import { Router } from "express";
import { Institution } from "../models/Institution.js";

const router = Router();

function formatInstitution(r: any) {
  return {
    id: r._id.toString(),
    institutionCode: r.institutionCode,
    name: r.name,
    type: r.type,
    district: r.district,
    address: r.address,
    superintendentName: r.superintendentName ?? null,
    contactEmail: r.contactEmail ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/institutions", async (_req, res): Promise<void> => {
  const rows = await Institution.find().sort({ name: 1 });
  res.json(rows.map(formatInstitution));
});

router.post("/institutions", async (req, res): Promise<void> => {
  const { name, type, district, address, superintendentName, contactEmail } = req.body;
  if (!name || !type || !district || !address) {
    res.status(400).json({ error: "name, type, district, address are required" });
    return;
  }

  const count = await Institution.countDocuments();
  const institutionCode = `INST-${String(count + 1).padStart(4, "0")}`;

  const inst = await Institution.create({
    institutionCode,
    name,
    type,
    district,
    address,
    superintendentName,
    contactEmail,
  });

  res.status(201).json(formatInstitution(inst));
});

export default router;
