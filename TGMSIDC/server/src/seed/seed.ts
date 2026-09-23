import "dotenv/config";
import mongoose from "mongoose";
import { Institution } from "../models/Institution.js";
import { Vendor } from "../models/Vendor.js";
import { Equipment } from "../models/Equipment.js";
import { RateContract } from "../models/RateContract.js";
import { Indent } from "../models/Indent.js";
import { Tender } from "../models/Tender.js";
import { PurchaseOrder } from "../models/PurchaseOrder.js";
import { Delivery } from "../models/Delivery.js";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is required.");

  await mongoose.connect(uri);
  console.log("✔ Connected to MongoDB");

  // Check if already seeded
  const existing = await Institution.countDocuments();
  if (existing > 0) {
    console.log(`⚠ Already seeded with ${existing} institutions. Skipping.`);
    await mongoose.disconnect();
    return;
  }

  console.log("🌱 Seeding database...\n");

  // ─── Institutions ─────────────────────────────────────────────────────────
  const [inst1, inst2, inst3] = await Institution.insertMany([
    {
      institutionCode: "INST-0001",
      name: "Osmania General Hospital",
      type: "hospital",
      district: "Hyderabad",
      address: "Afzalgunj, Hyderabad - 500012",
      superintendentName: "Dr. M. Rajesh Kumar",
      contactEmail: "sup@osmania.gov.in",
    },
    {
      institutionCode: "INST-0002",
      name: "Gandhi Hospital",
      type: "district_hospital",
      district: "Hyderabad",
      address: "Musheerabad, Hyderabad - 500003",
      superintendentName: "Dr. S. Padma",
      contactEmail: "admin@gandhi.gov.in",
    },
    {
      institutionCode: "INST-0003",
      name: "Warangal District Hospital",
      type: "district_hospital",
      district: "Warangal",
      address: "Station Road, Warangal - 506001",
      superintendentName: "Dr. B. Naresh",
      contactEmail: "wdh@health.telangana.gov.in",
    },
  ]);
  console.log("✓ Institutions seeded (3)");

  // ─── Vendors ──────────────────────────────────────────────────────────────
  const [vendor1, vendor2, vendor3] = await Vendor.insertMany([
    {
      vendorCode: "VND-0001",
      name: "BPL Medical Technologies Ltd",
      contactEmail: "sales@bpl.in",
      contactPhone: "+91-80-12345678",
      address: "Doddakannelli, Bengaluru - 560035",
      gstNumber: "29AABCB1234L1ZH",
      isL1Bidder: true,
      performanceScore: 87.5,
      status: "active",
    },
    {
      vendorCode: "VND-0002",
      name: "Siemens Healthineers India Pvt Ltd",
      contactEmail: "procurement@siemens-healthineers.in",
      contactPhone: "+91-22-66000000",
      address: "Nirlon Knowledge Park, Mumbai - 400063",
      gstNumber: "27AABCS5001N1ZH",
      isL1Bidder: false,
      performanceScore: 91.2,
      status: "active",
    },
    {
      vendorCode: "VND-0003",
      name: "Nidek Medical India Pvt Ltd",
      contactEmail: "info@nidekmedical.in",
      contactPhone: "+91-40-27661234",
      address: "Jubilee Hills, Hyderabad - 500033",
      gstNumber: "36AABCN4567L1ZH",
      isL1Bidder: true,
      performanceScore: 79.3,
      status: "active",
    },
  ]);
  console.log("✓ Vendors seeded (3)");

  // ─── Equipment ────────────────────────────────────────────────────────────
  const [equip1, equip2, equip3, equip4] = await Equipment.insertMany([
    {
      equipmentCode: "EQP-0001",
      name: "Digital X-Ray Machine",
      category: "imaging",
      specifications: "DR System, 400mA, DICOM compatible, Pixel size ≤ 100µm, CsI flat panel detector, 43x43cm FOV",
      gstRate: 12,
      standardised: true,
    },
    {
      equipmentCode: "EQP-0002",
      name: "ICU Ventilator",
      category: "icu",
      specifications: "Adult/Paediatric ventilator, Volume/Pressure controlled, O2 concentration 21-100%, PEEP 0-30 cmH2O, built-in battery backup 4hrs",
      gstRate: 12,
      standardised: true,
    },
    {
      equipmentCode: "EQP-0003",
      name: "Fully Automated Biochemistry Analyser",
      category: "laboratory",
      specifications: "Throughput ≥ 400 tests/hr, ISE module, 40+ on-board reagents, refrigerated reagent compartment, auto-calibration",
      gstRate: 12,
      standardised: true,
    },
    {
      equipmentCode: "EQP-0004",
      name: "Ultrasound Machine (B-Mode)",
      category: "imaging",
      specifications: "Colour Doppler, 3.5 & 7.5 MHz probes, B-Mode/B+M/Colour Doppler, 15\" LCD, DICOM 3.0",
      gstRate: 12,
      standardised: true,
    },
  ]);
  console.log("✓ Equipment seeded (4)");

  // ─── Rate Contracts ───────────────────────────────────────────────────────
  const rcStart = new Date("2025-04-01");
  const rcEnd = new Date("2026-03-31");
  const rcEndSoon = new Date("2025-12-31");

  const [rc1, rc2, rc3] = await RateContract.insertMany([
    {
      contractNumber: "RC-2025-0001",
      equipmentId: equip1._id,
      vendorId: vendor1._id,
      unitPrice: 850000,
      gstRate: 12,
      warrantyYears: 3,
      cmcCharges: 85000,
      cmcStartYear: 4,
      status: "active",
      startDate: rcStart,
      endDate: rcEnd,
    },
    {
      contractNumber: "RC-2025-0002",
      equipmentId: equip2._id,
      vendorId: vendor2._id,
      unitPrice: 320000,
      gstRate: 12,
      warrantyYears: 2,
      cmcCharges: 32000,
      cmcStartYear: 3,
      status: "active",
      startDate: rcStart,
      endDate: rcEndSoon,
    },
    {
      contractNumber: "RC-2025-0003",
      equipmentId: equip3._id,
      vendorId: vendor3._id,
      unitPrice: 1200000,
      gstRate: 12,
      warrantyYears: 2,
      cmcCharges: 120000,
      cmcStartYear: 3,
      status: "active",
      startDate: rcStart,
      endDate: rcEnd,
    },
  ]);
  console.log("✓ Rate Contracts seeded (3)");

  // ─── Indents ──────────────────────────────────────────────────────────────
  const [indent1, indent2, indent3, indent4] = await Indent.insertMany([
    {
      indentNumber: "IND-2025-0001",
      facilityId: inst1._id,
      equipmentId: equip1._id,
      quantity: 2,
      technicalRequirements: "Digital X-Ray for radiology department. Must be DR system with DICOM compatibility for integration with HIS. Requires flat panel detector, minimum 400mA output.",
      status: "linked_to_rc",
      procurementMode: "rate_contract",
      rateContractId: rc1._id,
      digitisedBy: "Data Entry Operator",
      approvedBy: "GM Equipment",
    },
    {
      indentNumber: "IND-2025-0002",
      facilityId: inst2._id,
      equipmentId: equip2._id,
      quantity: 5,
      technicalRequirements: "ICU ventilators for COVID ICU expansion. Must support adult and paediatric modes. Battery backup mandatory for power outages.",
      status: "pending_approval",
      digitisedBy: "DEO Gandhi Hospital",
    },
    {
      indentNumber: "IND-2025-0003",
      facilityId: inst3._id,
      equipmentId: equip3._id,
      quantity: 1,
      technicalRequirements: "Biochemistry analyser for upgraded central lab. Throughput of 400+ tests/hr required for district hospital workload.",
      status: "po_issued",
      procurementMode: "rate_contract",
      rateContractId: rc3._id,
      digitisedBy: "DEO Warangal",
      approvedBy: "GM Equipment",
    },
    {
      indentNumber: "IND-2025-0004",
      facilityId: inst1._id,
      equipmentId: equip4._id,
      quantity: 3,
      technicalRequirements: "Colour Doppler ultrasound for OPD and emergency department. Must include convex and linear probes.",
      status: "tender_initiated",
      procurementMode: "tender",
      digitisedBy: "Data Entry Operator",
      approvedBy: "GM Equipment",
    },
  ]);
  console.log("✓ Indents seeded (4)");

  // ─── Tender ───────────────────────────────────────────────────────────────
  const [tender1] = await Tender.insertMany([
    {
      tenderNumber: "TND-2025-0001",
      indentId: indent4._id,
      status: "bids_received",
      tenderInvitedDate: new Date("2025-10-01"),
      bidsReceivedDate: new Date("2025-11-15"),
      notes: "Tender published on Government e-Procurement portal. 4 bids received. Technical evaluation in progress.",
    },
  ]);

  await Indent.findByIdAndUpdate(indent4._id, { tenderId: tender1._id });
  console.log("✓ Tenders seeded (1)");

  // ─── Purchase Orders ──────────────────────────────────────────────────────
  const [po1, po2] = await PurchaseOrder.insertMany([
    {
      poNumber: "PO-2025-00001",
      indentId: indent1._id,
      rateContractId: rc1._id,
      vendorId: vendor1._id,
      equipmentId: equip1._id,
      quantity: 2,
      unitPrice: 850000,
      gstRate: 12,
      totalAmount: 850000 * 2 * 1.12,
      status: "approved",
      deliveryAddress: "Medical Stores Officer, Osmania General Hospital, Afzalgunj, Hyderabad 500012",
      expectedDeliveryDate: new Date("2026-01-31"),
    },
    {
      poNumber: "PO-2025-00002",
      indentId: indent3._id,
      rateContractId: rc3._id,
      vendorId: vendor3._id,
      equipmentId: equip3._id,
      quantity: 1,
      unitPrice: 1200000,
      gstRate: 12,
      totalAmount: 1200000 * 1.12,
      status: "delivered",
      deliveryAddress: "Medical Stores, Warangal District Hospital, Station Road, Warangal 506001",
      expectedDeliveryDate: new Date("2025-12-15"),
      actualDeliveryDate: new Date("2025-12-12"),
    },
  ]);
  console.log("✓ Purchase Orders seeded (2)");

  // ─── Deliveries ───────────────────────────────────────────────────────────
  await Delivery.insertMany([
    {
      qrCode: "QR-1704067200000-ABCDEF",
      purchaseOrderId: po2._id,
      vendorId: vendor3._id,
      facilityId: inst3._id,
      quantity: 1,
      status: "qa_passed",
      dispatchDate: new Date("2025-12-08"),
      deliveredDate: new Date("2025-12-12"),
      qaComplianceScore: 100,
      qaNotes: "All technical specifications met. NABL accreditation documents verified. Test certificates in order.",
      documentsUploaded: true,
      acceptanceCertificateIssued: false,
    },
    {
      qrCode: "QR-1704067200000-XYZABC",
      purchaseOrderId: po1._id,
      vendorId: vendor1._id,
      facilityId: inst1._id,
      quantity: 2,
      status: "qa_pending",
      dispatchDate: new Date("2025-12-20"),
      deliveredDate: new Date("2025-12-28"),
      documentsUploaded: false,
      acceptanceCertificateIssued: false,
    },
  ]);
  console.log("✓ Deliveries seeded (2)");

  console.log("\n✅ Database seed complete!");
  console.log("   - 3 institutions");
  console.log("   - 3 vendors");
  console.log("   - 4 equipment records");
  console.log("   - 3 rate contracts");
  console.log("   - 4 indents");
  console.log("   - 1 tender");
  console.log("   - 2 purchase orders");
  console.log("   - 2 deliveries");

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
