import type {
  Indent, RateContract, PurchaseOrder, Tender, Delivery,
  Vendor, Institution, Equipment, DashboardSummary,
  PipelineStage, ActivityItem, SlaMetrics, VendorPerformance,
} from "@workspace/api-client-react";

export interface MockInvoice {
  id: number;
  invoiceNumber: string;
  poId: number;
  poNumber: string;
  vendorName: string;
  amount: number;
  status: "pending" | "paid" | "partial";
  invoiceDate: string;
  paidDate: string | null;
}

export const mockInvoices: MockInvoice[] = [
  {
    id: 1,
    invoiceNumber: "SSA/INV/2025-26/0011",
    poId: 1,
    poNumber: "441A/591/HPC/EQU/2025-26",
    vendorName: "M/s. Sri Srinivasa Agencies",
    amount: 556125,
    status: "paid",
    invoiceDate: "2026-03-16",
    paidDate: "2026-04-02",
  },
  {
    id: 2,
    invoiceNumber: "GAMS/01533/22-23",
    poId: 2,
    poNumber: "216/418/HPC/EQU/Vemulawada/2022-23",
    vendorName: "M/s. Green Apple Medical Systems",
    amount: 682500,
    status: "paid",
    invoiceDate: "2022-11-02",
    paidDate: "2022-12-01",
  },
  {
    id: 3,
    invoiceNumber: "INV/NMI/2026/0112",
    poId: 3,
    poNumber: "IND/HPC/EQU/WDH/PO/2026/003",
    vendorName: "Nidek Medical India Pvt Ltd",
    amount: 1344000,
    status: "pending",
    invoiceDate: "2026-04-28",
    paidDate: null,
  },
];

export const mockInstitutions: Institution[] = [
  { id: 1, institutionCode: "INST-0001", name: "Osmania General Hospital", type: "hospital", district: "Hyderabad", address: "Afzalgunj, Hyderabad 500012", superintendentName: "Dr. V. Ramaiah", contactEmail: "super@ogh.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 2, institutionCode: "INST-0002", name: "Gandhi Hospital", type: "hospital", district: "Secunderabad", address: "Musheerabad, Hyderabad 500003", superintendentName: "Dr. K. Suresh", contactEmail: "super@gandhi.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 3, institutionCode: "INST-0003", name: "Warangal District Hospital", type: "district_hospital", district: "Warangal", address: "Hanamkonda, Warangal 506001", superintendentName: "Dr. P. Reddy", contactEmail: "super@wdh.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 4, institutionCode: "INST-0004", name: "Govt. General Hospital, Sangareddy", type: "hospital", district: "Sangareddy", address: "Sangareddy - 502001, Medak Dist.", superintendentName: "Dr. S. Narayana", contactEmail: "super@gghsangareddy.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 5, institutionCode: "INST-0005", name: "Area Hospital, Vemulawada", type: "hospital", district: "Rajanna Sircilla", address: "Vemulawada - 505 302, Rajanna Sircilla Dist.", superintendentName: "Dr. K. Santhosh Chari", contactEmail: "super@ahvemulawada.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 6, institutionCode: "INST-0006", name: "CHC Pitlam, Kamareddy", type: "chc", district: "Kamareddy", address: "Pitlam, Kamareddy District", superintendentName: "Dr. M. Lakshmi", contactEmail: "super@chcpitlam.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 7, institutionCode: "INST-0007", name: "Nizam's Institute of Medical Sciences", type: "hospital", district: "Hyderabad", address: "Punjagutta, Hyderabad 500082", superintendentName: "Dr. A. Ramesh Kumar", contactEmail: "super@nims.gov.in", createdAt: "2025-01-01T00:00:00Z" },
];

export const mockVendors: Vendor[] = [
  { id: 1, vendorCode: "VND-0001", name: "BPL Medical Technologies Ltd", contactEmail: "procurement@bplmedical.in", contactPhone: "9848012345", address: "MIDC, Pune, Maharashtra 411019", gstNumber: "27AABCB1234C1Z5", isL1Bidder: false, performanceScore: 87, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 2, vendorCode: "VND-0002", name: "Siemens Healthineers India Pvt Ltd", contactEmail: "bid@siemens-healthineers.in", contactPhone: "9848023456", address: "Sector 18, Gurugram, Haryana 122015", gstNumber: "06AAECS5678D1Z2", isL1Bidder: false, performanceScore: 94, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 3, vendorCode: "VND-0003", name: "Nidek Medical India Pvt Ltd", contactEmail: "sales@nidekmedical.in", contactPhone: "9848034567", address: "Electronic City, Bengaluru, Karnataka 560100", gstNumber: "29AABCN2345E1Z8", isL1Bidder: false, performanceScore: 91, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 4, vendorCode: "VND-0004", name: "M/s. Sri Srinivasa Agencies", contactEmail: "saisrinivasa123@gmail.com", contactPhone: "9391003370", address: "Flat No. 7-2-1813/5/A/1, 3rd Floor, H.No. 7-2-1813/5/A/1, 20B-348/HD/AP/2002/W, Sanathnagar, Hyderabad - 500018", gstNumber: "36ACWFS9933Q1ZO", isL1Bidder: true, performanceScore: 88, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 5, vendorCode: "VND-0005", name: "M/s. Green Apple Medical Systems", contactEmail: "greenapplemedicalsystems@gmail.com", contactPhone: "040-23400046", address: "Flat No. E310, SVSS Nivas, H.No. 7-2-1813/5/A/1, Street No.1, Czech Colony, Sanathnagar, Hyderabad - 500 018", gstNumber: "36AADAG1234B1Z3", isL1Bidder: false, performanceScore: 92, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 6, vendorCode: "VND-0006", name: "M/s. Bhargav Enterprises", contactEmail: "bhargav.enterprises@gmail.com", contactPhone: "9848056789", address: "Himayatnagar, Hyderabad 500029", gstNumber: "36AABFB4567C1Z1", isL1Bidder: false, performanceScore: 83, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 7, vendorCode: "VND-0007", name: "Xcellance Medicaltechnologies Pvt Ltd", contactEmail: "info@xcellancemedical.in", contactPhone: "9848067890", address: "Bengaluru, Karnataka 560001", gstNumber: "29AABCX8901D1Z4", isL1Bidder: false, performanceScore: 89, status: "active", createdAt: "2025-01-01T00:00:00Z" },
];

export const mockEquipment: Equipment[] = [
  { id: 1, equipmentCode: "EQP-0001", name: "Digital X-Ray Machine (DR System)", category: "imaging", specifications: "DR System, 400mA, DICOM compatible, Pixel size ≤ 150 μm, Detector 43×43 cm, GSTIN: 36AADAT9639G1Z2", standardised: true, gstRate: 5, createdAt: "2025-01-01T00:00:00Z" },
  { id: 2, equipmentCode: "EQP-0002", name: "ICU Ventilator", category: "icu", specifications: "Adult/Paediatric ventilator, Volume/Pressure modes, FiO₂ 21–100%, PEEP 0–35 cmH₂O", standardised: true, gstRate: 12, createdAt: "2025-01-01T00:00:00Z" },
  { id: 3, equipmentCode: "EQP-0003", name: "Fully Automated Biochemistry Analyser", category: "laboratory", specifications: "Throughput ≥ 400 tests/hr, ISE module, 4°C on-board cooling, LIS interface", standardised: true, gstRate: 12, createdAt: "2025-01-01T00:00:00Z" },
  { id: 4, equipmentCode: "EQP-0004", name: "Ultrasound Machine (Colour Doppler)", category: "imaging", specifications: "Colour Doppler, 3.5 & 7.5 MHz probes, B-Mode, DICOM 3.0, battery backup ≥ 1 hr", standardised: true, gstRate: 5, createdAt: "2025-01-01T00:00:00Z" },
  { id: 5, equipmentCode: "EQP-0005", name: "DEXA Scanner", category: "imaging", specifications: "Dual Energy X-Ray Absorptiometry for Endocrinology Dept; BMD measurement, T-score/Z-score reporting, DICOM 3.0, scan time ≤ 6 min; Rate Contract for 2 years", standardised: true, gstRate: 5, createdAt: "2025-01-01T00:00:00Z" },
  { id: 6, equipmentCode: "EQP-0006", name: "Surgical Diathermy / Cautery Machine", category: "operation_theatre", specifications: "Model: Sigma+, Make: Xcellance Medicaltechnologies Pvt Ltd, HSN/SAC: 90189099, GST: 5%, Country of Origin: India. Accessories: Cord for Mains (C020), Footswitch Single Paddle (B029), Footswitch Double Paddle (B030), Patient Return Electrode Silicon (D127), Monopolar Handwriting Pencil (D001)", standardised: true, gstRate: 5, createdAt: "2025-01-01T00:00:00Z" },
  { id: 7, equipmentCode: "EQP-0007", name: "Mammogram Compatible Computed Radiography (CR)", category: "imaging", specifications: "Make: Fuji Film, Model: PCR Prima TM with DRY PIX Edge, DICOM compatible, for Radiology / X-Ray Department", standardised: true, gstRate: 5, createdAt: "2025-01-01T00:00:00Z" },
  { id: 8, equipmentCode: "EQP-0008", name: "Patient Monitor (Multi-Parameter)", category: "icu", specifications: "ECG, SpO₂, NIBP, Temp, EtCO₂; 12.1\" colour TFT, battery backup ≥ 4 hrs, DICOM/HL7", standardised: true, gstRate: 12, createdAt: "2025-01-01T00:00:00Z" },
  { id: 9, equipmentCode: "EQP-0009", name: "Paracetamol 500mg Tablets IP", category: "pharmacy", specifications: "Pack of 1000 tabs, IP 2022 compliant, blister packing, manufacturer DCG(I) licensed", standardised: true, gstRate: 5, createdAt: "2025-01-01T00:00:00Z" },
  { id: 10, equipmentCode: "EQP-0010", name: "Hospital Bed (Semi-Electric, 3-Function)", category: "furniture", specifications: "Steel frame powder-coated, 3-section mattress platform, head/foot electrically adjustable, manual height, side rails, castors with brakes, load 250 kg", standardised: true, gstRate: 18, createdAt: "2025-01-01T00:00:00Z" },
  { id: 11, equipmentCode: "EQP-0011", name: "Desktop Computer with Monitor (Govt. Spec)", category: "it_hardware", specifications: "i5 12th Gen, 16GB RAM, 512GB SSD, Windows 11 Pro, 21.5\" FHD monitor, keyboard+mouse, 3-year onsite warranty", standardised: true, gstRate: 18, createdAt: "2025-01-01T00:00:00Z" },
  { id: 12, equipmentCode: "EQP-0012", name: "Sterile Surgical Gloves (Powdered, Box/100)", category: "consumables", specifications: "Latex, sterile, powdered, Size 7.0, EN 455, BIS IS 15747, box of 100 pairs, shelf life ≥ 3 years", standardised: true, gstRate: 12, createdAt: "2025-01-01T00:00:00Z" },
  { id: 13, equipmentCode: "EQP-0013", name: "Minor Civil Works — OT Complex Renovation", category: "civil", specifications: "Antifungal wall coating, modular false ceiling, AHU ducting provisions, explosion-proof electrical, CPWD DSR 2023 rates", standardised: false, gstRate: 18, createdAt: "2025-01-01T00:00:00Z" },
];

export const mockRateContracts: RateContract[] = [
  { id: 1, contractNumber: "RC/HPC/EQU/2025-26/0001", equipmentId: 1, equipmentName: "Digital X-Ray Machine (DR System)", vendorId: 1, vendorName: "BPL Medical Technologies Ltd", unitPrice: 850000, gstRate: 5, warrantyYears: 3, cmcCharges: 45000, cmcStartYear: 4, status: "active", startDate: "2025-04-01", endDate: "2026-03-31", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
  { id: 2, contractNumber: "RC/HPC/EQU/2025-26/0002", equipmentId: 2, equipmentName: "ICU Ventilator", vendorId: 2, vendorName: "Siemens Healthineers India Pvt Ltd", unitPrice: 320000, gstRate: 12, warrantyYears: 2, cmcCharges: 28000, cmcStartYear: 3, status: "active", startDate: "2025-04-01", endDate: "2026-12-31", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
  { id: 3, contractNumber: "RC/HPC/EQU/2025-26/0003", equipmentId: 3, equipmentName: "Fully Automated Biochemistry Analyser", vendorId: 3, vendorName: "Nidek Medical India Pvt Ltd", unitPrice: 1200000, gstRate: 12, warrantyYears: 3, cmcCharges: 72000, cmcStartYear: 4, status: "active", startDate: "2025-04-01", endDate: "2026-09-30", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
  { id: 4, contractNumber: "RC/HPC/EQU/2025-26/0004", equipmentId: 6, equipmentName: "Surgical Diathermy / Cautery Machine", vendorId: 4, vendorName: "M/s. Sri Srinivasa Agencies", unitPrice: 185000, gstRate: 5, warrantyYears: 2, cmcCharges: 18000, cmcStartYear: 3, status: "active", startDate: "2025-04-01", endDate: "2027-03-31", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
  { id: 5, contractNumber: "RC/HPC/EQU/2025-26/0005", equipmentId: 7, equipmentName: "Mammogram Compatible CR System", vendorId: 5, vendorName: "M/s. Green Apple Medical Systems", unitPrice: 650000, gstRate: 5, warrantyYears: 3, cmcCharges: 55000, cmcStartYear: 4, status: "active", startDate: "2025-04-01", endDate: "2027-03-31", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
];

export const mockIndents: Indent[] = [
  { id: 1, indentNumber: "441A/591/HPC/EQU/2025-26", facilityId: 4, facilityName: "Govt. General Hospital, Sangareddy", equipmentId: 6, equipmentName: "Surgical Diathermy / Cautery Machine", quantity: 3, technicalRequirements: "Sigma+ model, HSN 90189099, 5% GST. Includes standard accessories: cord for mains (C020), footswitch single & double paddle, patient return electrode, monopolar handwriting pencil. Country of Origin: India", status: "po_issued", procurementMode: "rate_contract", rateContractId: 4, tenderId: null, rejectionReason: null, digitisedBy: "Clerk R. Sharma", approvedBy: "GM Equipment Wing", createdAt: "2025-12-01T09:00:00Z", updatedAt: "2026-01-11T11:00:00Z" },
  { id: 2, indentNumber: "216/418/HPC/EQU/Vemulawada/2022-23", facilityId: 5, facilityName: "Area Hospital, Vemulawada", equipmentId: 7, equipmentName: "Mammogram Compatible CR System", quantity: 1, technicalRequirements: "Fuji Film PCR Prima TM with DRY PIX Edge. For X-Ray / Radiology department. DICOM compatible. Installation and training required.", status: "po_issued", procurementMode: "rate_contract", rateContractId: 5, tenderId: null, rejectionReason: null, digitisedBy: "Clerk B. Rao", approvedBy: "GM Equipment Wing", createdAt: "2022-10-01T09:00:00Z", updatedAt: "2022-11-10T11:00:00Z" },
  { id: 3, indentNumber: "IND/HPC/EQU/WDH/2025-26/003", facilityId: 3, facilityName: "Warangal District Hospital", equipmentId: 3, equipmentName: "Fully Automated Biochemistry Analyser", quantity: 1, technicalRequirements: "≥400 tests/hr, ISE module, for new pathology lab", status: "po_issued", procurementMode: "rate_contract", rateContractId: 3, tenderId: null, rejectionReason: null, digitisedBy: "Clerk C. Verma", approvedBy: "GM Equipment Wing", createdAt: "2026-01-20T09:00:00Z", updatedAt: "2026-02-10T14:00:00Z" },
  { id: 4, indentNumber: "IND/HPC/EQU/OGH/2025-26/004", facilityId: 1, facilityName: "Osmania General Hospital", equipmentId: 5, equipmentName: "DEXA Scanner", quantity: 2, technicalRequirements: "Dual Energy X-Ray Absorptiometry for Endocrinology dept. BMD measurement, T-score/Z-score reporting. DICOM 3.0. Rate Contract period 2 years. As per TID No. 1A.67/HPC/EQU/2025-26.", status: "tender_initiated", procurementMode: "tender", rateContractId: null, tenderId: 1, rejectionReason: null, digitisedBy: "Clerk A. Sharma", approvedBy: "GM Equipment Wing", createdAt: "2025-12-15T09:00:00Z", updatedAt: "2026-01-03T09:00:00Z" },
  { id: 5, indentNumber: "IND/HPC/EQU/GH/2025-26/005", facilityId: 2, facilityName: "Gandhi Hospital", equipmentId: 2, equipmentName: "ICU Ventilator", quantity: 5, technicalRequirements: "Adult/Paediatric modes, PEEP support, for new ICU block", status: "pending_approval", procurementMode: null, rateContractId: null, tenderId: null, rejectionReason: null, digitisedBy: "Clerk B. Rao", approvedBy: null, createdAt: "2026-04-05T10:00:00Z", updatedAt: "2026-04-05T10:00:00Z" },
  { id: 6, indentNumber: "IND/HPC/EQU/NIMS/2025-26/006", facilityId: 7, facilityName: "Nizam's Institute of Medical Sciences", equipmentId: 1, equipmentName: "Digital X-Ray Machine (DR System)", quantity: 2, technicalRequirements: "Portable DR system for radiology wing. DICOM 3.0 compatible. AEC mandatory.", status: "pending_approval", procurementMode: null, rateContractId: null, tenderId: null, rejectionReason: null, digitisedBy: "Clerk D. Singh", approvedBy: null, createdAt: "2026-04-10T09:00:00Z", updatedAt: "2026-04-10T09:00:00Z" },
  { id: 7, indentNumber: "IND/HPC/EQU/CHC/KMR/2025-26/007", facilityId: 6, facilityName: "CHC Pitlam, Kamareddy", equipmentId: 8, equipmentName: "Patient Monitor (Multi-Parameter)", quantity: 4, technicalRequirements: "ECG, SpO₂, NIBP, Temp, EtCO₂; for newly constructed ward. 12.1\" colour display. Battery backup min 4 hrs.", status: "pending_approval", procurementMode: null, rateContractId: null, tenderId: null, rejectionReason: null, digitisedBy: "Clerk E. Reddy", approvedBy: null, createdAt: "2026-04-12T09:00:00Z", updatedAt: "2026-04-12T09:00:00Z" },
];

export const mockTenders: Tender[] = [
  {
    id: 1,
    tenderNumber: "1A.67/HPC/EQU/2025-26",
    indentId: 4,
    equipmentName: "DEXA Scanner",
    status: "bids_received",
    tenderInvitedDate: "2026-01-03",
    bidsReceivedDate: "2026-01-20",
    l1BidderName: null,
    l1BidderAmount: null,
    notes: "Tender ID: 662453. Published on 16.04.2025 in The Hindu (English) and Velugu (Telugu). 3 qualified bids received. Technical bids opened 20-01-2026 04:00 PM. Document verification scheduled at HPC HQ, DM&HS Campus, Koti, Hyderabad. EMD as per Annexure-1. Tender Processing Fee: ₹23,600 (incl. 18% GST). Bid Validity: 90 days.",
    createdAt: "2026-01-03T00:00:00Z",
    updatedAt: "2026-01-20T00:00:00Z",
  },
  {
    id: 2,
    tenderNumber: "3A.12/HPC/EQU/2024-25",
    indentId: 3,
    equipmentName: "ICU Ventilator (Adult/Paediatric)",
    status: "awarded",
    tenderInvitedDate: "2024-11-10",
    bidsReceivedDate: "2024-12-05",
    l1BidderName: "Siemens Healthineers India Pvt Ltd",
    l1BidderAmount: 315000,
    notes: "Tender ID: 589124. Published in The Hindu (English Daily) and Velugu (Telugu Daily) on 10-Nov-2024. 4 technically qualified bids received. L1 bidder: Siemens Healthineers India Pvt Ltd @ ₹3,15,000/unit. Rate Contract period: 2 years. Awarded vide G.O. Rt. No. 4521/DM&HS/2025 dt. 15-Jan-2025. EMD: ₹1,25,000 via RTGS. TPF: ₹23,600 (incl. GST).",
    createdAt: "2024-11-10T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: 3,
    tenderNumber: "5C.23/HPC/EQU/2025-26",
    indentId: 4,
    equipmentName: "Ultrasound Machine (Colour Doppler)",
    status: "technical_evaluation",
    tenderInvitedDate: "2026-02-18",
    bidsReceivedDate: "2026-03-12",
    l1BidderName: null,
    l1BidderAmount: null,
    notes: "Tender ID: 721893. Published in The Hindu and Velugu on 18-Feb-2026. 5 bids received. Technical evaluation underway by Er. K. Srinivas (GM Equipment) and external consultant (AIIMS Hyderabad). Document verification completed 14-Mar-2026. Financial bids sealed — to be opened post technical qualification. EMD: ₹97,500. TPF: ₹23,600. Bid Validity: 90 days from 12-Mar-2026.",
    createdAt: "2026-02-18T00:00:00Z",
    updatedAt: "2026-03-12T00:00:00Z",
  },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: "441A/591/HPC/EQU/2025-26",
    indentId: 1,
    rateContractId: 4,
    vendorId: 4,
    vendorName: "M/s. Sri Srinivasa Agencies",
    equipmentId: 6,
    equipmentName: "Surgical Diathermy / Cautery Machine (Sigma+)",
    quantity: 3,
    unitPrice: 185000,
    gstRate: 5,
    totalAmount: 582750,
    status: "delivered",
    deliveryAddress: "The Medical Superintendent, GGH, Sangareddy, Sangareddy - 502001, Medak Dist.",
    expectedDeliveryDate: "2026-03-01",
    actualDeliveryDate: "2026-03-14",
    cancellationReason: null,
    createdAt: "2026-01-11T10:00:00Z",
    updatedAt: "2026-03-14T12:00:00Z",
  },
  {
    id: 2,
    poNumber: "216/418/HPC/EQU/Vemulawada/2022-23",
    indentId: 2,
    rateContractId: 5,
    vendorId: 5,
    vendorName: "M/s. Green Apple Medical Systems",
    equipmentId: 7,
    equipmentName: "Mammogram Compatible CR System (Fuji Film)",
    quantity: 1,
    unitPrice: 650000,
    gstRate: 5,
    totalAmount: 682500,
    status: "delivered",
    deliveryAddress: "The Medical Superintendent, Area Hospital, Vemulawada - 505 302, Rajanna Sircilla Dist.",
    expectedDeliveryDate: "2022-11-10",
    actualDeliveryDate: "2022-11-02",
    cancellationReason: null,
    createdAt: "2022-10-15T09:00:00Z",
    updatedAt: "2022-11-21T00:00:00Z",
  },
  {
    id: 3,
    poNumber: "IND/HPC/EQU/WDH/PO/2026/003",
    indentId: 3,
    rateContractId: 3,
    vendorId: 3,
    vendorName: "Nidek Medical India Pvt Ltd",
    equipmentId: 3,
    equipmentName: "Fully Automated Biochemistry Analyser",
    quantity: 1,
    unitPrice: 1200000,
    gstRate: 12,
    totalAmount: 1344000,
    status: "draft",
    deliveryAddress: "Pathology Laboratory, Warangal District Hospital, Hanamkonda, Warangal 506001",
    expectedDeliveryDate: "2026-06-30",
    actualDeliveryDate: null,
    cancellationReason: null,
    createdAt: "2026-02-10T09:00:00Z",
    updatedAt: "2026-02-10T09:00:00Z",
  },
];

export const mockDeliveries: Delivery[] = [
  {
    id: 1,
    qrCode: "SSA/0506/25-26",
    purchaseOrderId: 1,
    poNumber: "441A/591/HPC/EQU/2025-26",
    vendorId: 4,
    vendorName: "M/s. Sri Srinivasa Agencies",
    facilityId: 4,
    facilityName: "Govt. General Hospital, Sangareddy",
    equipmentName: "Surgical Diathermy / Cautery Machine (Sigma+) — 3 Units with 15 accessories",
    quantity: 45,
    status: "qa_passed",
    dispatchDate: "2026-03-08",
    deliveredDate: "2026-03-14",
    qaComplianceScore: 100,
    qaNotes: "All 3 main units received with complete accessories (15 line items, 45 Nos. total). Serial Nos: SP426A04AL, SP426A05L, SP426A05Q. HSN/SAC: 90189099, GST 5%. Delivery Note No. SSA/0506/25-26 dated 14-Mar-26. Received in Good Condition (GGH Sangareddy Stores stamp). Buyer Order Ref: 441A/591/HPC/EQU/2025-26 dt. 11-Mar-26. Tax Amount: NIL.",
    discrepancyNotes: null,
    documentsUploaded: true,
    acceptanceCertificateIssued: false,
    createdAt: "2026-03-08T00:00:00Z",
    updatedAt: "2026-03-14T00:00:00Z",
  },
  {
    id: 2,
    qrCode: "GAMS/01650/22-23",
    purchaseOrderId: 2,
    poNumber: "216/418/HPC/EQU/Vemulawada/2022-23",
    vendorId: 5,
    vendorName: "M/s. Green Apple Medical Systems",
    facilityId: 5,
    facilityName: "Area Hospital, Vemulawada",
    equipmentName: "Mammogram Compatible CR System — Fuji Film PCR Prima TM with DRY PIX Edge",
    quantity: 1,
    status: "accepted",
    dispatchDate: "2022-11-02",
    deliveredDate: "2022-11-02",
    qaComplianceScore: 100,
    qaNotes: "Delivery Challan: GAMS/01650/22-23 dt. 02.11.2022. Invoice: GAMS/01533/22-23 dt. 02.11.2022. Serial No.: 265F0021, 26130938. Warranty: 21/11/2022 – 30/11/2025. Installed and commissioned 21/11/2022. Annexure 6 signed by Head of Dept (K. Santhosh Chari, CAS, Paediatrics) and Service Engineer (D. Anil, 7995313331, Green Apple Medical Systems).",
    discrepancyNotes: null,
    documentsUploaded: true,
    acceptanceCertificateIssued: true,
    createdAt: "2022-11-02T00:00:00Z",
    updatedAt: "2022-11-21T00:00:00Z",
  },
  {
    id: 3,
    qrCode: "QR-2026-WDH-003",
    purchaseOrderId: 3,
    poNumber: "IND/HPC/EQU/WDH/PO/2026/003",
    vendorId: 3,
    vendorName: "Nidek Medical India Pvt Ltd",
    facilityId: 3,
    facilityName: "Warangal District Hospital",
    equipmentName: "Fully Automated Biochemistry Analyser",
    quantity: 1,
    status: "qa_pending",
    dispatchDate: null,
    deliveredDate: null,
    qaComplianceScore: null,
    qaNotes: null,
    discrepancyNotes: null,
    documentsUploaded: false,
    acceptanceCertificateIssued: false,
    createdAt: "2026-04-08T12:00:00Z",
    updatedAt: "2026-04-08T12:00:00Z",
  },
];

export const mockDashboard: DashboardSummary = {
  totalIndents: 7,
  pendingApproval: 3,
  activeRateContracts: 5,
  activePurchaseOrders: 3,
  deliveriesPendingQA: 1,
  expiringContracts: 1,
  totalVendors: 7,
  totalInstitutions: 7,
  avgProcycleDays: 18.4,
  qaRejectionRate: 0,
};

export const mockPipeline: PipelineStage[] = [
  { stage: "Pending Approval", count: 3, percentage: 43 },
  { stage: "Approved", count: 0, percentage: 0 },
  { stage: "Linked to RC", count: 0, percentage: 0 },
  { stage: "Tender Initiated", count: 1, percentage: 14 },
  { stage: "PO Issued", count: 3, percentage: 43 },
  { stage: "Rejected", count: 0, percentage: 0 },
];

export const mockActivity: ActivityItem[] = [
  { id: 1, type: "indent_approved", description: "Indent 441A/591/HPC/EQU/2025-26 approved — Surgical Diathermy linked to RC/HPC/EQU/2025-26/0004 (M/s. Sri Srinivasa Agencies)", entityId: 1, entityType: "indent", timestamp: "2026-01-11T11:00:00Z", actor: "GM Equipment Wing" },
  { id: 2, type: "po_created", description: "PO 441A/591/HPC/EQU/2025-26 issued to M/s. Sri Srinivasa Agencies for 3 Surgical Diathermy Units — GGH Sangareddy", entityId: 1, entityType: "purchase_order", timestamp: "2026-01-11T12:00:00Z", actor: "Finance Wing" },
  { id: 3, type: "qa_passed", description: "Delivery Note SSA/0506/25-26 — 45 Nos. received at GGH Sangareddy. QA 100%. Recd. in Good Condition (14-Mar-26)", entityId: 1, entityType: "delivery", timestamp: "2026-03-14T14:00:00Z", actor: "Biomedical Engineer T. Ramaiah" },
  { id: 4, type: "indent_submitted", description: "New indent IND/HPC/EQU/CHC/KMR/2025-26/007 — 4 Patient Monitors for CHC Pitlam, Kamareddy District", entityId: 7, entityType: "indent", timestamp: "2026-04-12T09:00:00Z", actor: "Clerk E. Reddy" },
  { id: 5, type: "tender_update", description: "Technical bids opened for Tender 1A.67/HPC/EQU/2025-26 (DEXA Scanner) — 3 bids received. Tender ID: 662453", entityId: 1, entityType: "tender", timestamp: "2026-01-20T16:00:00Z", actor: "Tender Cell, GM Equipment Wing" },
  { id: 6, type: "indent_approved", description: "Installation/Acceptance Certificate (Annexure 6) signed — Mammogram CR at AH Vemulawada. Installation date: 21/11/2022", entityId: 2, entityType: "delivery", timestamp: "2022-11-21T11:00:00Z", actor: "Dr. K. Santhosh Chari (Head of Dept)" },
];

export const mockSlaMetrics: SlaMetrics = {
  avgIndentToApprovalDays: 3.2,
  avgApprovalToPoDays: 7.8,
  avgPoToDeliveryDays: 21.4,
  slaBreaches: 4,
  onTrackCount: 23,
};

export const mockVendorPerformance: VendorPerformance[] = [
  { vendorId: 1, vendorName: "BPL Medical Technologies Ltd", totalOrders: 8, onTimeDeliveries: 6, qaPassRate: 87.5, avgLeadTimeDays: 42, performanceScore: 87 },
  { vendorId: 2, vendorName: "Siemens Healthineers India Pvt Ltd", totalOrders: 12, onTimeDeliveries: 11, qaPassRate: 96, avgLeadTimeDays: 35, performanceScore: 94 },
  { vendorId: 3, vendorName: "Nidek Medical India Pvt Ltd", totalOrders: 5, onTimeDeliveries: 5, qaPassRate: 100, avgLeadTimeDays: 30, performanceScore: 91 },
  { vendorId: 4, vendorName: "M/s. Sri Srinivasa Agencies", totalOrders: 6, onTimeDeliveries: 6, qaPassRate: 100, avgLeadTimeDays: 22, performanceScore: 96 },
  { vendorId: 5, vendorName: "M/s. Green Apple Medical Systems", totalOrders: 4, onTimeDeliveries: 4, qaPassRate: 100, avgLeadTimeDays: 18, performanceScore: 98 },
  { vendorId: 6, vendorName: "M/s. Bhargav Enterprises", totalOrders: 3, onTimeDeliveries: 2, qaPassRate: 90, avgLeadTimeDays: 35, performanceScore: 83 },
];

// ─── INVENTORY / SUPPLY CHAIN MOCK DATA ────────────────────────────────────

export interface FacilityStockPosition {
  facilityId: number;
  facilityName: string;
  district: string;
  itemId: number;
  itemName: string;
  itemCode: string;
  category: string;
  unit: string;
  stockOnHand: number;
  usableStock: number;
  blockedStock: number;
  stockInTransit: number;
  pendingIndentQty: number;
  nearExpiryStock: number;
  avgMonthlyConsumption: number;
  stockCoverDays: number;
  suggestedIndentQty: number;
  riskLevel: "normal" | "warning" | "high_risk" | "justification_required";
  unitPrice: number;
}

export const mockStockPositions: FacilityStockPosition[] = [
  { facilityId: 1, facilityName: "Osmania General Hospital", district: "Hyderabad", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", unit: "Box/1000", stockOnHand: 480, usableStock: 450, blockedStock: 30, stockInTransit: 100, pendingIndentQty: 200, nearExpiryStock: 50, avgMonthlyConsumption: 120, stockCoverDays: 113, suggestedIndentQty: 0, riskLevel: "warning", unitPrice: 180 },
  { facilityId: 1, facilityName: "Osmania General Hospital", district: "Hyderabad", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", category: "consumables", unit: "Box", stockOnHand: 210, usableStock: 200, blockedStock: 10, stockInTransit: 0, pendingIndentQty: 0, nearExpiryStock: 0, avgMonthlyConsumption: 80, stockCoverDays: 75, suggestedIndentQty: 50, riskLevel: "normal", unitPrice: 350 },
  { facilityId: 1, facilityName: "Osmania General Hospital", district: "Hyderabad", itemId: 8, itemName: "Patient Monitor (Multi-Parameter)", itemCode: "EQP-0008", category: "icu", unit: "No.", stockOnHand: 8, usableStock: 8, blockedStock: 0, stockInTransit: 0, pendingIndentQty: 0, nearExpiryStock: 0, avgMonthlyConsumption: 0, stockCoverDays: 999, suggestedIndentQty: 0, riskLevel: "normal", unitPrice: 85000 },
  { facilityId: 2, facilityName: "Gandhi Hospital", district: "Secunderabad", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", unit: "Box/1000", stockOnHand: 20, usableStock: 18, blockedStock: 2, stockInTransit: 0, pendingIndentQty: 100, nearExpiryStock: 8, avgMonthlyConsumption: 90, stockCoverDays: 6, suggestedIndentQty: 160, riskLevel: "high_risk", unitPrice: 180 },
  { facilityId: 2, facilityName: "Gandhi Hospital", district: "Secunderabad", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", category: "consumables", unit: "Box", stockOnHand: 5, usableStock: 5, blockedStock: 0, stockInTransit: 0, pendingIndentQty: 0, nearExpiryStock: 0, avgMonthlyConsumption: 60, stockCoverDays: 3, suggestedIndentQty: 120, riskLevel: "high_risk", unitPrice: 350 },
  { facilityId: 2, facilityName: "Gandhi Hospital", district: "Secunderabad", itemId: 2, itemName: "ICU Ventilator", itemCode: "EQP-0002", category: "icu", unit: "No.", stockOnHand: 5, usableStock: 5, blockedStock: 0, stockInTransit: 5, pendingIndentQty: 5, nearExpiryStock: 0, avgMonthlyConsumption: 0, stockCoverDays: 999, suggestedIndentQty: 0, riskLevel: "justification_required", unitPrice: 320000 },
  { facilityId: 3, facilityName: "Warangal District Hospital", district: "Warangal", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", unit: "Box/1000", stockOnHand: 300, usableStock: 280, blockedStock: 20, stockInTransit: 50, pendingIndentQty: 0, nearExpiryStock: 60, avgMonthlyConsumption: 70, stockCoverDays: 120, suggestedIndentQty: 0, riskLevel: "warning", unitPrice: 180 },
  { facilityId: 3, facilityName: "Warangal District Hospital", district: "Warangal", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", category: "consumables", unit: "Box", stockOnHand: 145, usableStock: 145, blockedStock: 0, stockInTransit: 0, pendingIndentQty: 0, nearExpiryStock: 0, avgMonthlyConsumption: 40, stockCoverDays: 109, suggestedIndentQty: 0, riskLevel: "normal", unitPrice: 350 },
  { facilityId: 4, facilityName: "Govt. General Hospital, Sangareddy", district: "Sangareddy", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", unit: "Box/1000", stockOnHand: 0, usableStock: 0, blockedStock: 0, stockInTransit: 0, pendingIndentQty: 0, nearExpiryStock: 0, avgMonthlyConsumption: 50, stockCoverDays: 0, suggestedIndentQty: 100, riskLevel: "high_risk", unitPrice: 180 },
  { facilityId: 4, facilityName: "Govt. General Hospital, Sangareddy", district: "Sangareddy", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", category: "consumables", unit: "Box", stockOnHand: 380, usableStock: 380, blockedStock: 0, stockInTransit: 0, pendingIndentQty: 100, nearExpiryStock: 0, avgMonthlyConsumption: 30, stockCoverDays: 380, suggestedIndentQty: 0, riskLevel: "justification_required", unitPrice: 350 },
  { facilityId: 5, facilityName: "Area Hospital, Vemulawada", district: "Rajanna Sircilla", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", unit: "Box/1000", stockOnHand: 60, usableStock: 55, blockedStock: 5, stockInTransit: 0, pendingIndentQty: 0, nearExpiryStock: 20, avgMonthlyConsumption: 30, stockCoverDays: 55, suggestedIndentQty: 20, riskLevel: "normal", unitPrice: 180 },
  { facilityId: 6, facilityName: "CHC Pitlam, Kamareddy", district: "Kamareddy", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", unit: "Box/1000", stockOnHand: 12, usableStock: 12, blockedStock: 0, stockInTransit: 0, pendingIndentQty: 30, nearExpiryStock: 0, avgMonthlyConsumption: 18, stockCoverDays: 20, suggestedIndentQty: 25, riskLevel: "warning", unitPrice: 180 },
  { facilityId: 7, facilityName: "Nizam's Institute of Medical Sciences", district: "Hyderabad", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", unit: "Box/1000", stockOnHand: 550, usableStock: 540, blockedStock: 10, stockInTransit: 0, pendingIndentQty: 200, nearExpiryStock: 80, avgMonthlyConsumption: 100, stockCoverDays: 162, suggestedIndentQty: 0, riskLevel: "justification_required", unitPrice: 180 },
  { facilityId: 7, facilityName: "Nizam's Institute of Medical Sciences", district: "Hyderabad", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", category: "consumables", unit: "Box", stockOnHand: 90, usableStock: 90, blockedStock: 0, stockInTransit: 20, pendingIndentQty: 0, nearExpiryStock: 0, avgMonthlyConsumption: 50, stockCoverDays: 54, suggestedIndentQty: 15, riskLevel: "normal", unitPrice: 350 },
];

export interface QuarantineLotStatusEntry { status: string; date: string; remarks: string; user: string; }
export interface QuarantineLot {
  id: number;
  lotNumber: string;
  itemId: number;
  itemName: string;
  itemCode: string;
  warehouseName: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  receivedDate: string;
  status: "received" | "under_quarantine" | "sample_pending" | "sample_collected" | "sent_for_testing" | "result_awaited" | "approved" | "rejected" | "released";
  statusHistory: QuarantineLotStatusEntry[];
  slaDays: number;
  agingDays: number;
  slaBreached: boolean;
  sampleCollectionDate?: string;
  testingReference?: string;
  labName?: string;
  labResultDate?: string;
  releaseRejectionRemarks?: string;
  documents: string[];
  vendorId: number;
  vendorName: string;
}

export const mockQuarantineLots: QuarantineLot[] = [
  {
    id: 1, lotNumber: "QAR/2026/001", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009",
    warehouseName: "Central Medical Warehouse, Hyderabad", quantity: 5000, unit: "Box/1000",
    batchNumber: "PCT/2026/B001", expiryDate: "2028-03-31", receivedDate: "2026-05-10",
    status: "result_awaited", slaDays: 21, agingDays: 41, slaBreached: true,
    sampleCollectionDate: "2026-05-14", testingReference: "CDL/HYD/2026/4421", labName: "Central Drug Laboratory, Hyderabad",
    documents: ["Delivery Challan — PCT-DC-2026-001.pdf", "Manufacturer CoA — Batch B001.pdf"],
    vendorId: 6, vendorName: "M/s. Bhargav Enterprises",
    statusHistory: [
      { status: "received", date: "2026-05-10", remarks: "5000 boxes received from M/s Bhargav Enterprises. Challan: PCT-DC-2026-001.", user: "Warehouse Officer R. Prasad" },
      { status: "under_quarantine", date: "2026-05-10", remarks: "Moved to quarantine bay Q-3.", user: "Warehouse Officer R. Prasad" },
      { status: "sample_pending", date: "2026-05-11", remarks: "Awaiting QC team for sample collection.", user: "System" },
      { status: "sample_collected", date: "2026-05-14", remarks: "10 samples drawn per IP protocol. Sealed and labelled.", user: "QC Officer S. Devi" },
      { status: "sent_for_testing", date: "2026-05-16", remarks: "Dispatched to CDL Hyderabad. Ref: CDL/HYD/2026/4421.", user: "QC Officer S. Devi" },
      { status: "result_awaited", date: "2026-05-16", remarks: "Awaiting lab result. SLA: 21 days from receipt.", user: "System" },
    ],
  },
  {
    id: 2, lotNumber: "QAR/2026/002", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012",
    warehouseName: "Central Medical Warehouse, Hyderabad", quantity: 800, unit: "Box",
    batchNumber: "GLV/2026/A120", expiryDate: "2029-06-30", receivedDate: "2026-06-01",
    status: "sample_pending", slaDays: 21, agingDays: 19, slaBreached: false,
    documents: ["Delivery Challan — GLV-DC-2026-120.pdf"],
    vendorId: 4, vendorName: "M/s. Sri Srinivasa Agencies",
    statusHistory: [
      { status: "received", date: "2026-06-01", remarks: "800 boxes received. Delivery Note: GLV-DC-2026-120.", user: "Warehouse Officer R. Prasad" },
      { status: "under_quarantine", date: "2026-06-01", remarks: "Placed in quarantine area Q-1.", user: "Warehouse Officer R. Prasad" },
      { status: "sample_pending", date: "2026-06-02", remarks: "Pending QC team availability.", user: "System" },
    ],
  },
  {
    id: 3, lotNumber: "QAR/2026/003", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009",
    warehouseName: "Regional Warehouse, Warangal", quantity: 2000, unit: "Box/1000",
    batchNumber: "PCT/2026/B002", expiryDate: "2027-12-31", receivedDate: "2026-06-05",
    status: "approved", slaDays: 21, agingDays: 15, slaBreached: false,
    sampleCollectionDate: "2026-06-07", testingReference: "CDL/WGL/2026/0812", labName: "Regional Drug Testing Lab, Warangal",
    labResultDate: "2026-06-15", releaseRejectionRemarks: "All parameters conform to IP 2022. Certificate of Analysis verified. Approved for release.",
    documents: ["CoA — Batch B002.pdf", "Lab Report CDL/WGL/0812.pdf"],
    vendorId: 6, vendorName: "M/s. Bhargav Enterprises",
    statusHistory: [
      { status: "received", date: "2026-06-05", remarks: "2000 boxes received.", user: "Warehouse Officer K. Raju" },
      { status: "under_quarantine", date: "2026-06-05", remarks: "Quarantine bay Q-2.", user: "Warehouse Officer K. Raju" },
      { status: "sample_pending", date: "2026-06-06", remarks: "", user: "System" },
      { status: "sample_collected", date: "2026-06-07", remarks: "Samples collected by QC Officer.", user: "QC Officer M. Rao" },
      { status: "sent_for_testing", date: "2026-06-08", remarks: "Sent to CDL Warangal.", user: "QC Officer M. Rao" },
      { status: "result_awaited", date: "2026-06-08", remarks: "", user: "System" },
      { status: "approved", date: "2026-06-15", remarks: "All parameters conform to IP 2022.", user: "QC Supervisor P. Laxmi" },
    ],
  },
  {
    id: 4, lotNumber: "QAR/2026/004", itemId: 8, itemName: "Patient Monitor (Multi-Parameter)", itemCode: "EQP-0008",
    warehouseName: "Central Medical Warehouse, Hyderabad", quantity: 12, unit: "No.",
    batchNumber: "PM/2026/0044", expiryDate: "2031-12-31", receivedDate: "2026-06-10",
    status: "under_quarantine", slaDays: 14, agingDays: 10, slaBreached: false,
    documents: ["Packing List — PM-PL-2026-044.pdf"],
    vendorId: 1, vendorName: "BPL Medical Technologies Ltd",
    statusHistory: [
      { status: "received", date: "2026-06-10", remarks: "12 units received from BPL Medical. Packing List: PM-PL-2026-044.", user: "Warehouse Officer R. Prasad" },
      { status: "under_quarantine", date: "2026-06-10", remarks: "Physical inspection pending. Awaiting biomedical engineer assignment.", user: "Warehouse Officer R. Prasad" },
    ],
  },
  {
    id: 5, lotNumber: "QAR/2026/005", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012",
    warehouseName: "Regional Warehouse, Karimnagar", quantity: 300, unit: "Box",
    batchNumber: "GLV/2025/Z089", expiryDate: "2026-09-30", receivedDate: "2026-03-15",
    status: "rejected", slaDays: 21, agingDays: 97, slaBreached: true,
    sampleCollectionDate: "2026-03-18", testingReference: "CDL/KNR/2026/0309", labName: "Drug Testing Lab, Karimnagar",
    labResultDate: "2026-04-02", releaseRejectionRemarks: "Failed sterility test. Batch non-conforming. Returned to vendor M/s Bhargav Enterprises.",
    documents: ["Lab Rejection Report.pdf", "Return Note to Vendor.pdf"],
    vendorId: 6, vendorName: "M/s. Bhargav Enterprises",
    statusHistory: [
      { status: "received", date: "2026-03-15", remarks: "300 boxes received.", user: "Warehouse Officer T. Kumar" },
      { status: "under_quarantine", date: "2026-03-15", remarks: "", user: "Warehouse Officer T. Kumar" },
      { status: "sample_pending", date: "2026-03-16", remarks: "", user: "System" },
      { status: "sample_collected", date: "2026-03-18", remarks: "Samples collected.", user: "QC Officer B. Sai" },
      { status: "sent_for_testing", date: "2026-03-20", remarks: "Sent to CDL Karimnagar.", user: "QC Officer B. Sai" },
      { status: "result_awaited", date: "2026-03-20", remarks: "", user: "System" },
      { status: "rejected", date: "2026-04-02", remarks: "Failed sterility test. Non-conforming batch.", user: "QC Supervisor P. Laxmi" },
    ],
  },
  {
    id: 6, lotNumber: "QAR/2026/006", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009",
    warehouseName: "Central Medical Warehouse, Hyderabad", quantity: 3000, unit: "Box/1000",
    batchNumber: "PCT/2026/B003", expiryDate: "2028-06-30", receivedDate: "2026-06-15",
    status: "sample_collected", slaDays: 21, agingDays: 5, slaBreached: false,
    sampleCollectionDate: "2026-06-17",
    documents: ["Delivery Challan — PCT-DC-2026-003.pdf"],
    vendorId: 6, vendorName: "M/s. Bhargav Enterprises",
    statusHistory: [
      { status: "received", date: "2026-06-15", remarks: "3000 boxes received.", user: "Warehouse Officer R. Prasad" },
      { status: "under_quarantine", date: "2026-06-15", remarks: "Bay Q-4.", user: "Warehouse Officer R. Prasad" },
      { status: "sample_pending", date: "2026-06-16", remarks: "", user: "System" },
      { status: "sample_collected", date: "2026-06-17", remarks: "12 samples drawn.", user: "QC Officer S. Devi" },
    ],
  },
];

export interface StockTransfer {
  id: number;
  transferNumber: string;
  sourceId: number;
  sourceName: string;
  destinationId: number;
  destinationName: string;
  itemId: number;
  itemName: string;
  itemCode: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  priority: "normal" | "urgent" | "critical";
  status: "draft" | "pending_approval" | "approved" | "dispatched" | "received" | "closed" | "rejected";
  remarks: string;
  initiatedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockStockTransfers: StockTransfer[] = [
  { id: 1, transferNumber: "TRF/2026/001", sourceId: 1, sourceName: "Osmania General Hospital", destinationId: 4, destinationName: "Govt. General Hospital, Sangareddy", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", batchNumber: "PCT/2025/A040", expiryDate: "2027-06-30", quantity: 100, unit: "Box/1000", priority: "urgent", status: "dispatched", remarks: "Sangareddy stock-out. OGH has surplus. Near-expiry batches prioritized.", initiatedBy: "Supply Chain Officer D. Rao", approvedBy: "Deputy Director (Medical)", approvedAt: "2026-06-12T10:00:00Z", dispatchedAt: "2026-06-14T08:00:00Z", createdAt: "2026-06-11T09:00:00Z", updatedAt: "2026-06-14T08:00:00Z" },
  { id: 2, transferNumber: "TRF/2026/002", sourceId: 3, sourceName: "Warangal District Hospital", destinationId: 2, destinationName: "Gandhi Hospital", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", batchNumber: "GLV/2025/C015", expiryDate: "2028-03-31", quantity: 80, unit: "Box", priority: "critical", status: "pending_approval", remarks: "Gandhi Hospital glove stock critically low (3 days cover). WDH has 145-day cover.", initiatedBy: "Supply Chain Officer D. Rao", createdAt: "2026-06-18T11:00:00Z", updatedAt: "2026-06-18T11:00:00Z" },
  { id: 3, transferNumber: "TRF/2026/003", sourceId: 7, sourceName: "Nizam's Institute of Medical Sciences", destinationId: 6, destinationName: "CHC Pitlam, Kamareddy", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", batchNumber: "PCT/2025/B055", expiryDate: "2027-03-31", quantity: 30, unit: "Box/1000", priority: "urgent", status: "pending_approval", remarks: "CHC Pitlam at 20-day cover; NIMS at 162-day cover. Near-expiry batch at NIMS should move first.", initiatedBy: "Supply Chain Officer D. Rao", createdAt: "2026-06-18T12:00:00Z", updatedAt: "2026-06-18T12:00:00Z" },
  { id: 4, transferNumber: "TRF/2026/004", sourceId: 4, sourceName: "Govt. General Hospital, Sangareddy", destinationId: 5, destinationName: "Area Hospital, Vemulawada", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", batchNumber: "GLV/2025/A099", expiryDate: "2029-01-31", quantity: 120, unit: "Box", priority: "normal", status: "approved", remarks: "Sangareddy overstock (380-day cover). Vemulawada can absorb.", initiatedBy: "Supply Chain Officer D. Rao", approvedBy: "Deputy Director (Medical)", approvedAt: "2026-06-16T14:00:00Z", createdAt: "2026-06-15T10:00:00Z", updatedAt: "2026-06-16T14:00:00Z" },
  { id: 5, transferNumber: "TRF/2026/005", sourceId: 1, sourceName: "Osmania General Hospital", destinationId: 4, destinationName: "Govt. General Hospital, Sangareddy", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", batchNumber: "PCT/2025/A038", expiryDate: "2026-09-30", quantity: 50, unit: "Box/1000", priority: "urgent", status: "received", remarks: "Near-expiry batch (Sep-26 expiry) redistributed to high-consumption Sangareddy.", initiatedBy: "Supply Chain Officer D. Rao", approvedBy: "Deputy Director (Medical)", approvedAt: "2026-05-20T10:00:00Z", dispatchedAt: "2026-05-22T07:00:00Z", receivedAt: "2026-05-23T15:00:00Z", createdAt: "2026-05-19T09:00:00Z", updatedAt: "2026-05-23T15:00:00Z" },
  { id: 6, transferNumber: "TRF/2026/006", sourceId: 3, sourceName: "Warangal District Hospital", destinationId: 6, destinationName: "CHC Pitlam, Kamareddy", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", batchNumber: "GLV/2025/B071", expiryDate: "2028-09-30", quantity: 40, unit: "Box", priority: "normal", status: "closed", remarks: "Routine redistribution. Closed after receipt confirmation.", initiatedBy: "Supply Chain Officer D. Rao", approvedBy: "Deputy Director (Medical)", approvedAt: "2026-04-02T09:00:00Z", dispatchedAt: "2026-04-04T08:00:00Z", receivedAt: "2026-04-06T14:00:00Z", createdAt: "2026-04-01T10:00:00Z", updatedAt: "2026-04-10T10:00:00Z" },
];

export interface StockBatch {
  id: number;
  batchNumber: string;
  itemId: number;
  itemName: string;
  itemCode: string;
  category: string;
  facilityId: number;
  facilityName: string;
  district: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  receivedDate: string;
  status: "available" | "near_expiry" | "expired" | "quarantine" | "blocked";
  unitPrice: number;
  fefoDeviation: boolean;
  recommendedAction?: string;
}

export const mockStockBatches: StockBatch[] = [
  { id: 1, batchNumber: "PCT/2025/A038", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", facilityId: 1, facilityName: "Osmania General Hospital", district: "Hyderabad", quantity: 50, unit: "Box/1000", expiryDate: "2026-07-31", receivedDate: "2025-08-01", status: "near_expiry", unitPrice: 180, fefoDeviation: false, recommendedAction: "Priority Issue / Redistribute" },
  { id: 2, batchNumber: "PCT/2025/A040", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", facilityId: 1, facilityName: "Osmania General Hospital", district: "Hyderabad", quantity: 200, unit: "Box/1000", expiryDate: "2027-06-30", receivedDate: "2025-09-01", status: "available", unitPrice: 180, fefoDeviation: false },
  { id: 3, batchNumber: "PCT/2025/B055", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", facilityId: 7, facilityName: "Nizam's Institute of Medical Sciences", district: "Hyderabad", quantity: 80, unit: "Box/1000", expiryDate: "2027-03-31", receivedDate: "2025-10-01", status: "near_expiry", unitPrice: 180, fefoDeviation: true, recommendedAction: "Redistribute to CHC Pitlam" },
  { id: 4, batchNumber: "PCT/2025/C012", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", facilityId: 3, facilityName: "Warangal District Hospital", district: "Warangal", quantity: 60, unit: "Box/1000", expiryDate: "2026-10-31", receivedDate: "2025-11-01", status: "near_expiry", unitPrice: 180, fefoDeviation: false, recommendedAction: "Priority Issue" },
  { id: 5, batchNumber: "GLV/2025/A099", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", category: "consumables", facilityId: 4, facilityName: "Govt. General Hospital, Sangareddy", district: "Sangareddy", quantity: 380, unit: "Box", expiryDate: "2029-01-31", receivedDate: "2025-12-01", status: "available", unitPrice: 350, fefoDeviation: false },
  { id: 6, batchNumber: "GLV/2025/C015", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", category: "consumables", facilityId: 3, facilityName: "Warangal District Hospital", district: "Warangal", quantity: 145, unit: "Box", expiryDate: "2028-03-31", receivedDate: "2026-01-01", status: "available", unitPrice: 350, fefoDeviation: false },
  { id: 7, batchNumber: "GLV/2024/Z089", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", category: "consumables", facilityId: 5, facilityName: "Area Hospital, Vemulawada", district: "Rajanna Sircilla", quantity: 22, unit: "Box", expiryDate: "2026-08-31", receivedDate: "2024-09-01", status: "near_expiry", unitPrice: 350, fefoDeviation: false, recommendedAction: "Priority Issue / Dispose if not usable" },
  { id: 8, batchNumber: "PCT/2024/X001", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", facilityId: 4, facilityName: "Govt. General Hospital, Sangareddy", district: "Sangareddy", quantity: 0, unit: "Box/1000", expiryDate: "2026-05-31", receivedDate: "2024-06-01", status: "expired", unitPrice: 180, fefoDeviation: false, recommendedAction: "Dispose / Return to Vendor" },
  { id: 9, batchNumber: "PM/2026/0044", itemId: 8, itemName: "Patient Monitor (Multi-Parameter)", itemCode: "EQP-0008", category: "icu", facilityId: 1, facilityName: "Osmania General Hospital", district: "Hyderabad", quantity: 8, unit: "No.", expiryDate: "2031-12-31", receivedDate: "2026-06-10", status: "available", unitPrice: 85000, fefoDeviation: false },
  { id: 10, batchNumber: "PCT/2026/B003", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", category: "pharmacy", facilityId: 2, facilityName: "Gandhi Hospital", district: "Secunderabad", quantity: 20, unit: "Box/1000", expiryDate: "2028-06-30", receivedDate: "2026-01-15", status: "available", unitPrice: 180, fefoDeviation: false },
];

export interface ForecastItem {
  itemId: number;
  itemName: string;
  itemCode: string;
  unit: string;
  forecastMethod: string;
  forecastAccuracy: number;
  monthly: { period: string; actual: number | null; forecast: number; adjusted: number | null; }[];
}

export const nearExpiryTrend = [
  { month: "Jan 2026", batches: 3, critical: 1, warning: 2 },
  { month: "Feb 2026", batches: 4, critical: 1, warning: 3 },
  { month: "Mar 2026", batches: 5, critical: 2, warning: 3 },
  { month: "Apr 2026", batches: 4, critical: 1, warning: 3 },
  { month: "May 2026", batches: 6, critical: 2, warning: 4 },
  { month: "Jun 2026", batches: 7, critical: 3, warning: 4 },
];

export const mockForecasts: ForecastItem[] = [
  {
    itemId: 9, itemName: "Paracetamol 500mg Tablets IP", itemCode: "EQP-0009", unit: "Box/1000", forecastMethod: "Weighted Moving Average", forecastAccuracy: 94.0,
    monthly: [
      { period: "Jan 2026", actual: 118, forecast: 115, adjusted: null },
      { period: "Feb 2026", actual: 105, forecast: 112, adjusted: null },
      { period: "Mar 2026", actual: 130, forecast: 110, adjusted: null },
      { period: "Apr 2026", actual: 122, forecast: 120, adjusted: null },
      { period: "May 2026", actual: 115, forecast: 118, adjusted: null },
      { period: "Jun 2026", actual: 108, forecast: 116, adjusted: null },
      { period: "Jul 2026", actual: null, forecast: 120, adjusted: 125 },
      { period: "Aug 2026", actual: null, forecast: 125, adjusted: null },
      { period: "Sep 2026", actual: null, forecast: 128, adjusted: null },
    ],
  },
  {
    itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", itemCode: "EQP-0012", unit: "Box", forecastMethod: "Moving Average (3-month)", forecastAccuracy: 94.5,
    monthly: [
      { period: "Jan 2026", actual: 62, forecast: 60, adjusted: null },
      { period: "Feb 2026", actual: 58, forecast: 62, adjusted: null },
      { period: "Mar 2026", actual: 70, forecast: 63, adjusted: null },
      { period: "Apr 2026", actual: 65, forecast: 65, adjusted: null },
      { period: "May 2026", actual: 61, forecast: 66, adjusted: null },
      { period: "Jun 2026", actual: 68, forecast: 65, adjusted: null },
      { period: "Jul 2026", actual: null, forecast: 68, adjusted: 72 },
      { period: "Aug 2026", actual: null, forecast: 70, adjusted: null },
      { period: "Sep 2026", actual: null, forecast: 69, adjusted: null },
    ],
  },
  {
    itemId: 2, itemName: "ICU Ventilator", itemCode: "EQP-0002", unit: "No.", forecastMethod: "Trend-Based Estimate", forecastAccuracy: 65.7,
    monthly: [
      { period: "Jan 2026", actual: 2, forecast: 2, adjusted: null },
      { period: "Feb 2026", actual: 1, forecast: 2, adjusted: null },
      { period: "Mar 2026", actual: 3, forecast: 2, adjusted: null },
      { period: "Apr 2026", actual: 5, forecast: 3, adjusted: null },
      { period: "May 2026", actual: 4, forecast: 4, adjusted: null },
      { period: "Jun 2026", actual: 3, forecast: 4, adjusted: null },
      { period: "Jul 2026", actual: null, forecast: 4, adjusted: null },
      { period: "Aug 2026", actual: null, forecast: 5, adjusted: null },
      { period: "Sep 2026", actual: null, forecast: 5, adjusted: null },
    ],
  },
];

export interface DistributionRecord {
  facilityId: number;
  facilityName: string;
  district: string;
  period: string;
  itemId: number;
  itemName: string;
  procured: number;
  received: number;
  distributed: number;
  consumed: number;
  stockOnHand: number;
  nearExpiry: number;
  expired: number;
  wasted: number;
  unit: string;
}

export const mockDistributionData: DistributionRecord[] = [
  { facilityId: 1, facilityName: "Osmania General Hospital", district: "Hyderabad", period: "FY 2025-26", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", procured: 1400, received: 1380, distributed: 1200, consumed: 1180, stockOnHand: 480, nearExpiry: 50, expired: 20, wasted: 5, unit: "Box/1000" },
  { facilityId: 2, facilityName: "Gandhi Hospital", district: "Secunderabad", period: "FY 2025-26", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", procured: 1100, received: 1080, distributed: 960, consumed: 930, stockOnHand: 20, nearExpiry: 8, expired: 30, wasted: 8, unit: "Box/1000" },
  { facilityId: 3, facilityName: "Warangal District Hospital", district: "Warangal", period: "FY 2025-26", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", procured: 840, received: 840, distributed: 760, consumed: 720, stockOnHand: 300, nearExpiry: 60, expired: 0, wasted: 2, unit: "Box/1000" },
  { facilityId: 4, facilityName: "Govt. General Hospital, Sangareddy", district: "Sangareddy", period: "FY 2025-26", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", procured: 600, received: 600, distributed: 550, consumed: 530, stockOnHand: 0, nearExpiry: 0, expired: 15, wasted: 3, unit: "Box/1000" },
  { facilityId: 5, facilityName: "Area Hospital, Vemulawada", district: "Rajanna Sircilla", period: "FY 2025-26", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", procured: 360, received: 360, distributed: 320, consumed: 310, stockOnHand: 60, nearExpiry: 20, expired: 5, wasted: 1, unit: "Box/1000" },
  { facilityId: 6, facilityName: "CHC Pitlam, Kamareddy", district: "Kamareddy", period: "FY 2025-26", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", procured: 220, received: 210, distributed: 195, consumed: 190, stockOnHand: 12, nearExpiry: 0, expired: 2, wasted: 0, unit: "Box/1000" },
  { facilityId: 7, facilityName: "Nizam's Institute of Medical Sciences", district: "Hyderabad", period: "FY 2025-26", itemId: 9, itemName: "Paracetamol 500mg Tablets IP", procured: 1200, received: 1200, distributed: 1000, consumed: 960, stockOnHand: 550, nearExpiry: 80, expired: 10, wasted: 2, unit: "Box/1000" },
  { facilityId: 1, facilityName: "Osmania General Hospital", district: "Hyderabad", period: "FY 2025-26", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", procured: 960, received: 950, distributed: 850, consumed: 840, stockOnHand: 210, nearExpiry: 0, expired: 5, wasted: 2, unit: "Box" },
  { facilityId: 2, facilityName: "Gandhi Hospital", district: "Secunderabad", period: "FY 2025-26", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", procured: 720, received: 720, distributed: 680, consumed: 670, stockOnHand: 5, nearExpiry: 0, expired: 8, wasted: 1, unit: "Box" },
  { facilityId: 3, facilityName: "Warangal District Hospital", district: "Warangal", period: "FY 2025-26", itemId: 12, itemName: "Sterile Surgical Gloves (Box/100)", procured: 480, received: 475, distributed: 400, consumed: 390, stockOnHand: 145, nearExpiry: 0, expired: 0, wasted: 0, unit: "Box" },
];

export interface KPIMetric {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  unit: string;
  thresholdGreen: number;
  thresholdAmber: number;
  thresholdRed: number;
  direction: "lower_is_better" | "higher_is_better";
  status: "green" | "amber" | "red";
  trend: "up" | "down" | "stable";
  historicalValues: { period: string; value: number }[];
}

export const mockKPIs: KPIMetric[] = [
  { id: "stock_out_rate", name: "Stock-Out Rate", description: "% of item-locations with zero stock", currentValue: 8.3, unit: "%", thresholdGreen: 5, thresholdAmber: 10, thresholdRed: 15, direction: "lower_is_better", status: "amber", trend: "up", historicalValues: [{ period: "Mar 26", value: 6.2 }, { period: "Apr 26", value: 7.1 }, { period: "May 26", value: 7.8 }, { period: "Jun 26", value: 8.3 }] },
  { id: "overstock_rate", name: "Overstock Rate", description: "% of item-locations with >90 days cover", currentValue: 21.4, unit: "%", thresholdGreen: 15, thresholdAmber: 25, thresholdRed: 35, direction: "lower_is_better", status: "amber", trend: "down", historicalValues: [{ period: "Mar 26", value: 25.0 }, { period: "Apr 26", value: 23.5 }, { period: "May 26", value: 22.1 }, { period: "Jun 26", value: 21.4 }] },
  { id: "near_expiry_pct", name: "Near-Expiry Stock %", description: "% of total stock quantity nearing expiry (≤90d)", currentValue: 12.7, unit: "%", thresholdGreen: 8, thresholdAmber: 15, thresholdRed: 25, direction: "lower_is_better", status: "amber", trend: "up", historicalValues: [{ period: "Mar 26", value: 10.2 }, { period: "Apr 26", value: 11.0 }, { period: "May 26", value: 12.1 }, { period: "Jun 26", value: 12.7 }] },
  { id: "expiry_wastage_pct", name: "Expiry / Wastage %", description: "% of total received stock expired or wasted", currentValue: 2.1, unit: "%", thresholdGreen: 2, thresholdAmber: 5, thresholdRed: 8, direction: "lower_is_better", status: "amber", trend: "down", historicalValues: [{ period: "Mar 26", value: 2.8 }, { period: "Apr 26", value: 2.5 }, { period: "May 26", value: 2.3 }, { period: "Jun 26", value: 2.1 }] },
  { id: "avg_quarantine_days", name: "Avg Quarantine Time", description: "Average days from receipt to QC release", currentValue: 18.4, unit: "days", thresholdGreen: 14, thresholdAmber: 21, thresholdRed: 30, direction: "lower_is_better", status: "amber", trend: "stable", historicalValues: [{ period: "Mar 26", value: 19.2 }, { period: "Apr 26", value: 18.8 }, { period: "May 26", value: 18.6 }, { period: "Jun 26", value: 18.4 }] },
  { id: "on_time_release_pct", name: "On-Time Release %", description: "% of quarantine lots released within SLA", currentValue: 72.0, unit: "%", thresholdGreen: 85, thresholdAmber: 70, thresholdRed: 60, direction: "higher_is_better", status: "amber", trend: "up", historicalValues: [{ period: "Mar 26", value: 65.0 }, { period: "Apr 26", value: 68.0 }, { period: "May 26", value: 70.0 }, { period: "Jun 26", value: 72.0 }] },
  { id: "redistribution_tat", name: "Redistribution TAT", description: "Avg days from transfer initiation to receipt", currentValue: 4.2, unit: "days", thresholdGreen: 5, thresholdAmber: 7, thresholdRed: 10, direction: "lower_is_better", status: "green", trend: "stable", historicalValues: [{ period: "Mar 26", value: 5.1 }, { period: "Apr 26", value: 4.8 }, { period: "May 26", value: 4.5 }, { period: "Jun 26", value: 4.2 }] },
  { id: "forecast_accuracy", name: "Forecast Accuracy", description: "% accuracy of demand forecast vs actual consumption", currentValue: 87.3, unit: "%", thresholdGreen: 85, thresholdAmber: 75, thresholdRed: 65, direction: "higher_is_better", status: "green", trend: "up", historicalValues: [{ period: "Mar 26", value: 82.0 }, { period: "Apr 26", value: 84.5 }, { period: "May 26", value: 86.0 }, { period: "Jun 26", value: 87.3 }] },
  { id: "issue_consumption_lag", name: "Issue-to-Consumption Lag", description: "Avg days between stock issue and consumption record", currentValue: 6.8, unit: "days", thresholdGreen: 7, thresholdAmber: 14, thresholdRed: 21, direction: "lower_is_better", status: "green", trend: "stable", historicalValues: [{ period: "Mar 26", value: 8.2 }, { period: "Apr 26", value: 7.5 }, { period: "May 26", value: 7.1 }, { period: "Jun 26", value: 6.8 }] },
  { id: "fefo_compliance", name: "FEFO Compliance %", description: "% of issues following FEFO/FIFO discipline", currentValue: 78.5, unit: "%", thresholdGreen: 90, thresholdAmber: 80, thresholdRed: 70, direction: "higher_is_better", status: "red", trend: "up", historicalValues: [{ period: "Mar 26", value: 74.0 }, { period: "Apr 26", value: 75.5 }, { period: "May 26", value: 77.0 }, { period: "Jun 26", value: 78.5 }] },
];
