import { Router } from "express";
import { Vendor } from "../models/Vendor.js";

const router = Router();

function formatVendor(v: any) {
  return {
    id: v._id.toString(),
    vendorCode: v.vendorCode,
    name: v.name,
    contactEmail: v.contactEmail,
    contactPhone: v.contactPhone,
    address: v.address,
    gstNumber: v.gstNumber,
    isL1Bidder: v.isL1Bidder,
    performanceScore: v.performanceScore ?? null,
    status: v.status,
    createdAt: v.createdAt.toISOString(),
  };
}

router.get("/vendors", async (_req, res): Promise<void> => {
  const vendors = await Vendor.find().sort({ name: 1 });
  res.json(vendors.map(formatVendor));
});

router.post("/vendors", async (req, res): Promise<void> => {
  const { name, contactEmail, contactPhone, address, gstNumber, isL1Bidder, performanceScore } = req.body;
  if (!name || !contactEmail || !address || !gstNumber) {
    res.status(400).json({ error: "name, contactEmail, address, gstNumber are required" });
    return;
  }

  const count = await Vendor.countDocuments();
  const vendorCode = `VND-${String(count + 1).padStart(4, "0")}`;

  const vendor = await Vendor.create({
    vendorCode,
    name,
    contactEmail,
    contactPhone: contactPhone ?? "",
    address,
    gstNumber,
    isL1Bidder: isL1Bidder ?? false,
    performanceScore,
    status: "active",
  });

  res.status(201).json(formatVendor(vendor));
});

router.get("/vendors/:id", async (req, res): Promise<void> => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }
  res.json(formatVendor(vendor));
});

export default router;
