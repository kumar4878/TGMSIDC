import { Router } from "express";
import { PurchaseOrder } from "../models/PurchaseOrder.js";
import { RateContract } from "../models/RateContract.js";
import { Indent } from "../models/Indent.js";
import { Vendor } from "../models/Vendor.js";
import { Equipment } from "../models/Equipment.js";

const router = Router();

async function enrichPO(po: any) {
  const vendor = await Vendor.findById(po.vendorId);
  const equip = await Equipment.findById(po.equipmentId);
  return {
    id: po._id.toString(),
    poNumber: po.poNumber,
    indentId: po.indentId.toString(),
    rateContractId: po.rateContractId.toString(),
    vendorId: po.vendorId.toString(),
    vendorName: vendor?.name ?? "Unknown",
    equipmentId: po.equipmentId.toString(),
    equipmentName: equip?.name ?? "Unknown",
    quantity: po.quantity,
    unitPrice: po.unitPrice,
    gstRate: po.gstRate,
    totalAmount: po.totalAmount,
    status: po.status,
    deliveryAddress: po.deliveryAddress,
    expectedDeliveryDate: po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString() : null,
    actualDeliveryDate: po.actualDeliveryDate ? po.actualDeliveryDate.toISOString() : null,
    cancellationReason: po.cancellationReason ?? null,
    createdAt: po.createdAt.toISOString(),
    updatedAt: po.updatedAt.toISOString(),
  };
}

router.get("/purchase-orders", async (req, res): Promise<void> => {
  const filter: Record<string, any> = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.vendorId) filter.vendorId = req.query.vendorId;

  const rows = await PurchaseOrder.find(filter).sort({ createdAt: -1 });
  const enriched = await Promise.all(rows.map(enrichPO));
  res.json(enriched);
});

router.post("/purchase-orders", async (req, res): Promise<void> => {
  const { indentId, rateContractId, quantity, deliveryAddress, expectedDeliveryDate } = req.body;
  if (!indentId || !rateContractId || !quantity || !deliveryAddress) {
    res.status(400).json({ error: "indentId, rateContractId, quantity, deliveryAddress are required" });
    return;
  }

  const rc = await RateContract.findById(rateContractId);
  if (!rc) {
    res.status(404).json({ error: "Rate contract not found" });
    return;
  }

  const indent = await Indent.findById(indentId);
  if (!indent) {
    res.status(404).json({ error: "Indent not found" });
    return;
  }

  const count = await PurchaseOrder.countDocuments();
  const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const totalAmount = rc.unitPrice * quantity * (1 + rc.gstRate / 100);

  const po = await PurchaseOrder.create({
    poNumber,
    indentId,
    rateContractId,
    vendorId: rc.vendorId,
    equipmentId: rc.equipmentId,
    quantity,
    unitPrice: rc.unitPrice,
    gstRate: rc.gstRate,
    totalAmount,
    status: "draft",
    deliveryAddress,
    expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
  });

  await Indent.findByIdAndUpdate(indentId, { status: "po_issued" });

  res.status(201).json(await enrichPO(po));
});

router.get("/purchase-orders/:id", async (req, res): Promise<void> => {
  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }
  res.json(await enrichPO(po));
});

router.patch("/purchase-orders/:id", async (req, res): Promise<void> => {
  const { quantity, deliveryAddress, expectedDeliveryDate, status } = req.body;
  const update: Record<string, any> = {};
  if (quantity != null) update.quantity = quantity;
  if (deliveryAddress != null) update.deliveryAddress = deliveryAddress;
  if (expectedDeliveryDate != null) update.expectedDeliveryDate = new Date(expectedDeliveryDate);
  if (status != null) update.status = status;

  const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }
  res.json(await enrichPO(po));
});

router.post("/purchase-orders/:id/approve", async (req, res): Promise<void> => {
  const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }
  res.json(await enrichPO(po));
});

router.post("/purchase-orders/:id/cancel", async (req, res): Promise<void> => {
  const { cancellationReason, cancelledBy } = req.body;
  if (!cancellationReason || !cancelledBy) {
    res.status(400).json({ error: "cancellationReason and cancelledBy are required" });
    return;
  }

  const po = await PurchaseOrder.findByIdAndUpdate(
    req.params.id,
    { status: "cancelled", cancellationReason, cancelledBy },
    { new: true }
  );
  if (!po) {
    res.status(404).json({ error: "Purchase order not found" });
    return;
  }
  res.json(await enrichPO(po));
});

export default router;
