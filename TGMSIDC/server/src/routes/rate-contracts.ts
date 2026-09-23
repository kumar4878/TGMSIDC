import { Router } from "express";
import { RateContract } from "../models/RateContract.js";
import { Equipment } from "../models/Equipment.js";
import { Vendor } from "../models/Vendor.js";

const router = Router();

async function enrichRC(rc: any) {
  const equip = await Equipment.findById(rc.equipmentId);
  const vendor = await Vendor.findById(rc.vendorId);
  return {
    id: rc._id.toString(),
    contractNumber: rc.contractNumber,
    equipmentId: rc.equipmentId.toString(),
    equipmentName: equip?.name ?? "Unknown",
    vendorId: rc.vendorId.toString(),
    vendorName: vendor?.name ?? "Unknown",
    unitPrice: rc.unitPrice,
    gstRate: rc.gstRate,
    warrantyYears: rc.warrantyYears,
    cmcCharges: rc.cmcCharges,
    cmcStartYear: rc.cmcStartYear,
    status: rc.status,
    startDate: rc.startDate.toISOString(),
    endDate: rc.endDate.toISOString(),
    createdAt: rc.createdAt.toISOString(),
    updatedAt: rc.updatedAt.toISOString(),
  };
}

router.get("/rate-contracts/expiring-soon", async (_req, res): Promise<void> => {
  const sixtyDays = new Date();
  sixtyDays.setDate(sixtyDays.getDate() + 60);

  const rows = await RateContract.find({
    status: "active",
    endDate: { $lte: sixtyDays, $gte: new Date() },
  });

  const enriched = await Promise.all(rows.map(enrichRC));
  res.json(enriched);
});

router.get("/rate-contracts", async (req, res): Promise<void> => {
  const { status, equipmentId } = req.query;
  const filter: Record<string, any> = {};
  if (status) filter.status = status;
  if (equipmentId) filter.equipmentId = equipmentId;

  const rows = await RateContract.find(filter);
  const enriched = await Promise.all(rows.map(enrichRC));
  res.json(enriched);
});

router.post("/rate-contracts", async (req, res): Promise<void> => {
  const { equipmentId, vendorId, unitPrice, gstRate, warrantyYears, cmcCharges, cmcStartYear, startDate, endDate } = req.body;
  if (!equipmentId || !vendorId || !unitPrice || !startDate || !endDate) {
    res.status(400).json({ error: "equipmentId, vendorId, unitPrice, startDate, endDate are required" });
    return;
  }

  const count = await RateContract.countDocuments();
  const contractNumber = `RC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const rc = await RateContract.create({
    contractNumber,
    equipmentId,
    vendorId,
    unitPrice,
    gstRate: gstRate ?? 12,
    warrantyYears: warrantyYears ?? 1,
    cmcCharges: cmcCharges ?? 0,
    cmcStartYear: cmcStartYear ?? 2,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    status: "active",
  });

  res.status(201).json(await enrichRC(rc));
});

router.get("/rate-contracts/:id", async (req, res): Promise<void> => {
  const rc = await RateContract.findById(req.params.id);
  if (!rc) {
    res.status(404).json({ error: "Rate contract not found" });
    return;
  }
  res.json(await enrichRC(rc));
});

router.patch("/rate-contracts/:id", async (req, res): Promise<void> => {
  const { unitPrice, gstRate, status, endDate, cmcCharges } = req.body;
  const update: Record<string, any> = {};
  if (unitPrice != null) update.unitPrice = unitPrice;
  if (gstRate != null) update.gstRate = gstRate;
  if (status != null) update.status = status;
  if (endDate != null) update.endDate = new Date(endDate);
  if (cmcCharges != null) update.cmcCharges = cmcCharges;

  const rc = await RateContract.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!rc) {
    res.status(404).json({ error: "Rate contract not found" });
    return;
  }
  res.json(await enrichRC(rc));
});

export default router;
