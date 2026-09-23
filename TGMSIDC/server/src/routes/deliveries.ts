import { Router } from "express";
import { Delivery } from "../models/Delivery.js";
import { PurchaseOrder } from "../models/PurchaseOrder.js";
import { Vendor } from "../models/Vendor.js";
import { Institution } from "../models/Institution.js";
import { Equipment } from "../models/Equipment.js";

const router = Router();

function generateQR() {
  return `QR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function enrichDelivery(d: any) {
  const po = await PurchaseOrder.findById(d.purchaseOrderId);
  const vendor = await Vendor.findById(d.vendorId);
  const facility = await Institution.findById(d.facilityId);
  const equipmentName = po
    ? (await Equipment.findById(po.equipmentId))?.name ?? "Unknown"
    : "Unknown";

  return {
    id: d._id.toString(),
    qrCode: d.qrCode,
    purchaseOrderId: d.purchaseOrderId.toString(),
    poNumber: po?.poNumber ?? "Unknown",
    vendorId: d.vendorId.toString(),
    vendorName: vendor?.name ?? "Unknown",
    facilityId: d.facilityId.toString(),
    facilityName: facility?.name ?? "Unknown",
    equipmentName,
    quantity: d.quantity,
    status: d.status,
    dispatchDate: d.dispatchDate ? d.dispatchDate.toISOString() : null,
    deliveredDate: d.deliveredDate ? d.deliveredDate.toISOString() : null,
    qaComplianceScore: d.qaComplianceScore ?? null,
    qaNotes: d.qaNotes ?? null,
    discrepancyNotes: d.discrepancyNotes ?? null,
    documentsUploaded: d.documentsUploaded,
    acceptanceCertificateIssued: d.acceptanceCertificateIssued,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

router.get("/deliveries", async (req, res): Promise<void> => {
  const filter: Record<string, any> = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.poId) filter.purchaseOrderId = req.query.poId;

  const rows = await Delivery.find(filter).sort({ createdAt: -1 });
  const enriched = await Promise.all(rows.map(enrichDelivery));
  res.json(enriched);
});

router.post("/deliveries", async (req, res): Promise<void> => {
  const { purchaseOrderId, facilityId, quantity, dispatchDate } = req.body;
  if (!purchaseOrderId || !facilityId || !quantity || !dispatchDate) {
    res.status(400).json({ error: "purchaseOrderId, facilityId, quantity, dispatchDate are required" });
    return;
  }

  const po = await PurchaseOrder.findById(purchaseOrderId);
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }

  const delivery = await Delivery.create({
    qrCode: generateQR(),
    purchaseOrderId,
    vendorId: po.vendorId,
    facilityId,
    quantity,
    status: "dispatched",
    dispatchDate: new Date(dispatchDate),
    documentsUploaded: false,
    acceptanceCertificateIssued: false,
  });

  await PurchaseOrder.findByIdAndUpdate(purchaseOrderId, { status: "dispatched" });

  res.status(201).json(await enrichDelivery(delivery));
});

router.get("/deliveries/:id", async (req, res): Promise<void> => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    res.status(404).json({ error: "Delivery not found" });
    return;
  }
  res.json(await enrichDelivery(delivery));
});

router.patch("/deliveries/:id", async (req, res): Promise<void> => {
  const { status, deliveredDate, qaComplianceScore, qaNotes, discrepancyNotes, documentsUploaded } = req.body;
  const update: Record<string, any> = {};
  if (status != null) update.status = status;
  if (deliveredDate != null) update.deliveredDate = new Date(deliveredDate);
  if (qaComplianceScore != null) update.qaComplianceScore = qaComplianceScore;
  if (qaNotes != null) update.qaNotes = qaNotes;
  if (discrepancyNotes != null) update.discrepancyNotes = discrepancyNotes;
  if (documentsUploaded != null) update.documentsUploaded = documentsUploaded;

  const delivery = await Delivery.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!delivery) {
    res.status(404).json({ error: "Delivery not found" });
    return;
  }
  res.json(await enrichDelivery(delivery));
});

router.post("/deliveries/:id/accept", async (req, res): Promise<void> => {
  const current = await Delivery.findById(req.params.id);
  if (!current) {
    res.status(404).json({ error: "Delivery not found" });
    return;
  }

  if (current.qaComplianceScore == null || current.qaComplianceScore < 100) {
    res.status(400).json({ error: "QA compliance must be 100% before acceptance" });
    return;
  }

  if (!current.documentsUploaded) {
    res.status(400).json({ error: "All documents must be uploaded before acceptance" });
    return;
  }

  const delivery = await Delivery.findByIdAndUpdate(
    req.params.id,
    { status: "accepted", acceptanceCertificateIssued: true },
    { new: true }
  );

  await PurchaseOrder.findByIdAndUpdate(
    delivery!.purchaseOrderId,
    { status: "delivered", actualDeliveryDate: new Date() }
  );

  res.json(await enrichDelivery(delivery));
});

export default router;
