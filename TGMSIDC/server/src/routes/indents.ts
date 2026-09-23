import { Router } from "express";
import { Indent } from "../models/Indent.js";
import { Institution } from "../models/Institution.js";
import { Equipment } from "../models/Equipment.js";

const router = Router();

function padNum(n: number, len = 4) {
  return String(n).padStart(len, "0");
}

async function formatIndent(r: any) {
  const facility = await Institution.findById(r.facilityId);
  const equipment = await Equipment.findById(r.equipmentId);
  return {
    id: r._id.toString(),
    indentNumber: r.indentNumber,
    facilityId: r.facilityId.toString(),
    facilityName: facility?.name ?? "Unknown",
    equipmentId: r.equipmentId.toString(),
    equipmentName: equipment?.name ?? "Unknown",
    quantity: r.quantity,
    technicalRequirements: r.technicalRequirements,
    status: r.status,
    procurementMode: r.procurementMode ?? null,
    rateContractId: r.rateContractId?.toString() ?? null,
    tenderId: r.tenderId?.toString() ?? null,
    rejectionReason: r.rejectionReason ?? null,
    digitisedBy: r.digitisedBy,
    approvedBy: r.approvedBy ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

router.get("/indents", async (req, res): Promise<void> => {
  const filter: Record<string, any> = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.facilityId) filter.facilityId = req.query.facilityId;

  const rows = await Indent.find(filter).sort({ createdAt: -1 });
  const result = await Promise.all(rows.map(formatIndent));
  res.json(result);
});

router.post("/indents", async (req, res): Promise<void> => {
  const { facilityId, equipmentId, quantity, technicalRequirements, digitisedBy } = req.body;
  if (!facilityId || !equipmentId || !quantity || !technicalRequirements || !digitisedBy) {
    res.status(400).json({ error: "facilityId, equipmentId, quantity, technicalRequirements, digitisedBy are required" });
    return;
  }

  const count = await Indent.countDocuments();
  const indentNumber = `IND-${new Date().getFullYear()}-${padNum(count + 1)}`;

  const indent = await Indent.create({
    indentNumber,
    facilityId,
    equipmentId,
    quantity,
    technicalRequirements,
    digitisedBy,
    status: "pending_approval",
  });

  res.status(201).json(await formatIndent(indent));
});

router.get("/indents/:id", async (req, res): Promise<void> => {
  const indent = await Indent.findById(req.params.id);
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }
  res.json(await formatIndent(indent));
});

router.patch("/indents/:id", async (req, res): Promise<void> => {
  const { quantity, technicalRequirements, status } = req.body;
  const update: Record<string, any> = {};
  if (quantity != null) update.quantity = quantity;
  if (technicalRequirements != null) update.technicalRequirements = technicalRequirements;
  if (status != null) update.status = status;

  const indent = await Indent.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }
  res.json(await formatIndent(indent));
});

router.post("/indents/:id/approve", async (req, res): Promise<void> => {
  const { procurementMode, rateContractId, approvedBy } = req.body;
  if (!procurementMode || !approvedBy) {
    res.status(400).json({ error: "procurementMode and approvedBy are required" });
    return;
  }

  const newStatus = procurementMode === "rate_contract"
    ? (rateContractId ? "linked_to_rc" : "approved")
    : "tender_initiated";

  const update: Record<string, any> = { status: newStatus, procurementMode, approvedBy };
  if (rateContractId) update.rateContractId = rateContractId;

  const indent = await Indent.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }
  res.json(await formatIndent(indent));
});

router.post("/indents/:id/reject", async (req, res): Promise<void> => {
  const { rejectionReason } = req.body;
  if (!rejectionReason) {
    res.status(400).json({ error: "rejectionReason is required" });
    return;
  }

  const indent = await Indent.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", rejectionReason },
    { new: true }
  );
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }
  res.json(await formatIndent(indent));
});

export default router;
