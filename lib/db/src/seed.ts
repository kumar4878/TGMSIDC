import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import {
  institutionsTable, vendorsTable, equipmentTable,
  rateContractsTable, indentsTable, tendersTable,
  purchaseOrdersTable, deliveriesTable
} from "./schema";
import { eq } from "drizzle-orm";

const { Pool } = pg;

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Seeding database...");

  // Check if already seeded
  const existing = await db.select().from(institutionsTable);
  if (existing.length > 0) {
    console.log(`Already seeded with ${existing.length} institutions. Skipping.`);
    await pool.end();
    return;
  }

  // Seed Institutions
  const [inst1] = await db.insert(institutionsTable).values({
    institutionCode: "INST-0001",
    name: "Osmania General Hospital",
    type: "hospital",
    district: "Hyderabad",
    address: "Afzalgunj, Hyderabad - 500012",
    superintendentName: "Dr. M. Rajesh Kumar",
    contactEmail: "sup@osmania.gov.in",
  }).returning();

  const [inst2] = await db.insert(institutionsTable).values({
    institutionCode: "INST-0002",
    name: "Gandhi Hospital",
    type: "district_hospital",
    district: "Hyderabad",
    address: "Musheerabad, Hyderabad - 500003",
    superintendentName: "Dr. S. Padma",
    contactEmail: "admin@gandhi.gov.in",
  }).returning();

  const [inst3] = await db.insert(institutionsTable).values({
    institutionCode: "INST-0003",
    name: "Warangal District Hospital",
    type: "district_hospital",
    district: "Warangal",
    address: "Station Road, Warangal - 506001",
    superintendentName: "Dr. B. Naresh",
    contactEmail: "wdh@health.telangana.gov.in",
  }).returning();

  console.log("✓ Institutions seeded");

  // Seed Vendors
  const [vendor1] = await db.insert(vendorsTable).values({
    vendorCode: "VND-0001",
    name: "BPL Medical Technologies Ltd",
    contactEmail: "sales@bpl.in",
    contactPhone: "+91-80-12345678",
    address: "Doddakannelli, Bengaluru - 560035",
    gstNumber: "29AABCB1234L1ZH",
    isL1Bidder: true,
    performanceScore: 87.5,
    status: "active",
  }).returning();

  const [vendor2] = await db.insert(vendorsTable).values({
    vendorCode: "VND-0002",
    name: "Siemens Healthineers India Pvt Ltd",
    contactEmail: "procurement@siemens-healthineers.in",
    contactPhone: "+91-22-66000000",
    address: "Nirlon Knowledge Park, Mumbai - 400063",
    gstNumber: "27AABCS5001N1ZH",
    isL1Bidder: false,
    performanceScore: 91.2,
    status: "active",
  }).returning();

  const [vendor3] = await db.insert(vendorsTable).values({
    vendorCode: "VND-0003",
    name: "Nidek Medical India Pvt Ltd",
    contactEmail: "info@nidekmedical.in",
    contactPhone: "+91-40-27661234",
    address: "Jubilee Hills, Hyderabad - 500033",
    gstNumber: "36AABCN4567L1ZH",
    isL1Bidder: true,
    performanceScore: 79.3,
    status: "active",
  }).returning();

  console.log("✓ Vendors seeded");

  // Seed Equipment
  const [equip1] = await db.insert(equipmentTable).values({
    equipmentCode: "EQP-0001",
    name: "Digital X-Ray Machine",
    category: "imaging",
    specifications: "DR System, 400mA, DICOM compatible, Pixel size ≤ 100µm, CsI flat panel detector, 43x43cm FOV",
    gstRate: 12,
    standardised: true,
  }).returning();

  const [equip2] = await db.insert(equipmentTable).values({
    equipmentCode: "EQP-0002",
    name: "ICU Ventilator",
    category: "icu",
    specifications: "Adult/Paediatric ventilator, Volume/Pressure controlled, O2 concentration 21-100%, PEEP 0-30 cmH2O, built-in battery backup 4hrs",
    gstRate: 12,
    standardised: true,
  }).returning();

  const [equip3] = await db.insert(equipmentTable).values({
    equipmentCode: "EQP-0003",
    name: "Fully Automated Biochemistry Analyser",
    category: "laboratory",
    specifications: "Throughput ≥ 400 tests/hr, ISE module, 40+ on-board reagents, refrigerated reagent compartment, auto-calibration",
    gstRate: 12,
    standardised: true,
  }).returning();

  const [equip4] = await db.insert(equipmentTable).values({
    equipmentCode: "EQP-0004",
    name: "Ultrasound Machine (B-Mode)",
    category: "imaging",
    specifications: "Colour Doppler, 3.5 & 7.5 MHz probes, B-Mode/B+M/Colour Doppler, 15\" LCD, DICOM 3.0",
    gstRate: 12,
    standardised: true,
  }).returning();

  console.log("✓ Equipment seeded");

  // Seed Rate Contracts
  const rcStart = new Date("2025-04-01");
  const rcEnd = new Date("2026-03-31");
  const rcEndSoon = new Date("2025-12-31");

  const [rc1] = await db.insert(rateContractsTable).values({
    contractNumber: "RC-2025-0001",
    equipmentId: equip1.id,
    vendorId: vendor1.id,
    unitPrice: 850000,
    gstRate: 12,
    warrantyYears: 3,
    cmcCharges: 85000,
    cmcStartYear: 4,
    status: "active",
    startDate: rcStart,
    endDate: rcEnd,
  }).returning();

  const [rc2] = await db.insert(rateContractsTable).values({
    contractNumber: "RC-2025-0002",
    equipmentId: equip2.id,
    vendorId: vendor2.id,
    unitPrice: 320000,
    gstRate: 12,
    warrantyYears: 2,
    cmcCharges: 32000,
    cmcStartYear: 3,
    status: "active",
    startDate: rcStart,
    endDate: rcEndSoon,
  }).returning();

  const [rc3] = await db.insert(rateContractsTable).values({
    contractNumber: "RC-2025-0003",
    equipmentId: equip3.id,
    vendorId: vendor3.id,
    unitPrice: 1200000,
    gstRate: 12,
    warrantyYears: 2,
    cmcCharges: 120000,
    cmcStartYear: 3,
    status: "active",
    startDate: rcStart,
    endDate: rcEnd,
  }).returning();

  console.log("✓ Rate Contracts seeded");

  // Seed Indents
  const [indent1] = await db.insert(indentsTable).values({
    indentNumber: "IND-2025-0001",
    facilityId: inst1.id,
    equipmentId: equip1.id,
    quantity: 2,
    technicalRequirements: "Digital X-Ray for radiology department. Must be DR system with DICOM compatibility for integration with HIS. Requires flat panel detector, minimum 400mA output.",
    status: "linked_to_rc",
    procurementMode: "rate_contract",
    rateContractId: rc1.id,
    digitisedBy: "Data Entry Operator",
    approvedBy: "GM Equipment",
  }).returning();

  const [indent2] = await db.insert(indentsTable).values({
    indentNumber: "IND-2025-0002",
    facilityId: inst2.id,
    equipmentId: equip2.id,
    quantity: 5,
    technicalRequirements: "ICU ventilators for COVID ICU expansion. Must support adult and paediatric modes. Battery backup mandatory for power outages.",
    status: "pending_approval",
    digitisedBy: "DEO Gandhi Hospital",
  }).returning();

  const [indent3] = await db.insert(indentsTable).values({
    indentNumber: "IND-2025-0003",
    facilityId: inst3.id,
    equipmentId: equip3.id,
    quantity: 1,
    technicalRequirements: "Biochemistry analyser for upgraded central lab. Throughput of 400+ tests/hr required for district hospital workload.",
    status: "po_issued",
    procurementMode: "rate_contract",
    rateContractId: rc3.id,
    digitisedBy: "DEO Warangal",
    approvedBy: "GM Equipment",
  }).returning();

  const [indent4] = await db.insert(indentsTable).values({
    indentNumber: "IND-2025-0004",
    facilityId: inst1.id,
    equipmentId: equip4.id,
    quantity: 3,
    technicalRequirements: "Colour Doppler ultrasound for OPD and emergency department. Must include convex and linear probes.",
    status: "tender_initiated",
    procurementMode: "tender",
    digitisedBy: "Data Entry Operator",
    approvedBy: "GM Equipment",
  }).returning();

  console.log("✓ Indents seeded");

  // Seed Tender
  const [tender1] = await db.insert(tendersTable).values({
    tenderNumber: "TND-2025-0001",
    indentId: indent4.id,
    status: "bids_received",
    tenderInvitedDate: new Date("2025-10-01"),
    bidsReceivedDate: new Date("2025-11-15"),
    notes: "Tender published on Government e-Procurement portal. 4 bids received. Technical evaluation in progress.",
  }).returning();

  await db.update(indentsTable).set({ tenderId: tender1.id }).where(eq(indentsTable.id, indent4.id));

  console.log("✓ Tenders seeded");

  // Seed Purchase Orders
  const [po1] = await db.insert(purchaseOrdersTable).values({
    poNumber: "PO-2025-00001",
    indentId: indent1.id,
    rateContractId: rc1.id,
    vendorId: vendor1.id,
    equipmentId: equip1.id,
    quantity: 2,
    unitPrice: 850000,
    gstRate: 12,
    totalAmount: 850000 * 2 * 1.12,
    status: "approved",
    deliveryAddress: "Medical Stores Officer, Osmania General Hospital, Afzalgunj, Hyderabad 500012",
    expectedDeliveryDate: new Date("2026-01-31"),
  }).returning();

  const [po2] = await db.insert(purchaseOrdersTable).values({
    poNumber: "PO-2025-00002",
    indentId: indent3.id,
    rateContractId: rc3.id,
    vendorId: vendor3.id,
    equipmentId: equip3.id,
    quantity: 1,
    unitPrice: 1200000,
    gstRate: 12,
    totalAmount: 1200000 * 1.12,
    status: "delivered",
    deliveryAddress: "Medical Stores, Warangal District Hospital, Station Road, Warangal 506001",
    expectedDeliveryDate: new Date("2025-12-15"),
    actualDeliveryDate: new Date("2025-12-12"),
  }).returning();

  console.log("✓ Purchase Orders seeded");

  // Seed Delivery
  const [delivery1] = await db.insert(deliveriesTable).values({
    qrCode: "QR-1704067200000-ABCDEF",
    purchaseOrderId: po2.id,
    vendorId: vendor3.id,
    facilityId: inst3.id,
    quantity: 1,
    status: "qa_passed",
    dispatchDate: new Date("2025-12-08"),
    deliveredDate: new Date("2025-12-12"),
    qaComplianceScore: 100,
    qaNotes: "All technical specifications met. NABL accreditation documents verified. Test certificates in order.",
    documentsUploaded: true,
    acceptanceCertificateIssued: false,
  }).returning();

  const [delivery2] = await db.insert(deliveriesTable).values({
    qrCode: "QR-1704067200000-XYZABC",
    purchaseOrderId: po1.id,
    vendorId: vendor1.id,
    facilityId: inst1.id,
    quantity: 2,
    status: "qa_pending",
    dispatchDate: new Date("2025-12-20"),
    deliveredDate: new Date("2025-12-28"),
    qaComplianceScore: null,
    documentsUploaded: false,
    acceptanceCertificateIssued: false,
  }).returning();

  console.log("✓ Deliveries seeded");

  console.log("\n✅ Database seed complete!");
  console.log(`  - ${3} institutions`);
  console.log(`  - ${3} vendors`);
  console.log(`  - ${4} equipment records`);
  console.log(`  - ${3} rate contracts`);
  console.log(`  - ${4} indents`);
  console.log(`  - ${1} tender`);
  console.log(`  - ${2} purchase orders`);
  console.log(`  - ${2} deliveries`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
