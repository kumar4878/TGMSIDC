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
    poNumber: "441A/591/TGMSIDC/EQU/2025-26",
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
    poNumber: "216/418/TGMSIDC/EQU/Vemulawada/2022-23",
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
    poNumber: "IND/TGMSIDC/EQU/WDH/PO/2026/003",
    vendorName: "Nidek Medical India Pvt Ltd",
    amount: 1344000,
    status: "pending",
    invoiceDate: "2026-04-28",
    paidDate: null,
  },
];

export const mockInstitutions: Institution[] = [
  { id: 1, institutionCode: "INST-0001", name: "Osmania General Hospital", type: "hospital", district: "Hyderabad", address: "Afzalgunj, Hyderabad, Telangana 500012", superintendentName: "Dr. V. Ramaiah", contactEmail: "super@ogh.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 2, institutionCode: "INST-0002", name: "Gandhi Hospital", type: "hospital", district: "Secunderabad", address: "Musheerabad, Hyderabad, Telangana 500003", superintendentName: "Dr. K. Suresh", contactEmail: "super@gandhi.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 3, institutionCode: "INST-0003", name: "Warangal District Hospital", type: "district_hospital", district: "Warangal", address: "Hanamkonda, Warangal, Telangana 506001", superintendentName: "Dr. P. Reddy", contactEmail: "super@wdh.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 4, institutionCode: "INST-0004", name: "Govt. General Hospital, Sangareddy", type: "hospital", district: "Sangareddy", address: "Sangareddy - 502001, Medak Dist., Telangana", superintendentName: "Dr. S. Narayana", contactEmail: "super@gghsangareddy.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 5, institutionCode: "INST-0005", name: "Area Hospital, Vemulawada", type: "hospital", district: "Rajanna Sircilla", address: "Vemulawada - 505 302, Rajanna Sircilla Dist., Telangana", superintendentName: "Dr. K. Santhosh Chari", contactEmail: "super@ahvemulawada.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 6, institutionCode: "INST-0006", name: "CHC Pitlam, Kamareddy", type: "chc", district: "Kamareddy", address: "Pitlam, Kamareddy District, Telangana", superintendentName: "Dr. M. Lakshmi", contactEmail: "super@chcpitlam.gov.in", createdAt: "2025-01-01T00:00:00Z" },
  { id: 7, institutionCode: "INST-0007", name: "Nizam's Institute of Medical Sciences", type: "hospital", district: "Hyderabad", address: "Punjagutta, Hyderabad, Telangana 500082", superintendentName: "Dr. A. Ramesh Kumar", contactEmail: "super@nims.gov.in", createdAt: "2025-01-01T00:00:00Z" },
];

export const mockVendors: Vendor[] = [
  { id: 1, vendorCode: "VND-0001", name: "BPL Medical Technologies Ltd", contactEmail: "procurement@bplmedical.in", contactPhone: "9848012345", address: "MIDC, Pune, Maharashtra 411019", gstNumber: "27AABCB1234C1Z5", isL1Bidder: false, performanceScore: 87, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 2, vendorCode: "VND-0002", name: "Siemens Healthineers India Pvt Ltd", contactEmail: "bid@siemens-healthineers.in", contactPhone: "9848023456", address: "Sector 18, Gurugram, Haryana 122015", gstNumber: "06AAECS5678D1Z2", isL1Bidder: false, performanceScore: 94, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 3, vendorCode: "VND-0003", name: "Nidek Medical India Pvt Ltd", contactEmail: "sales@nidekmedical.in", contactPhone: "9848034567", address: "Electronic City, Bengaluru, Karnataka 560100", gstNumber: "29AABCN2345E1Z8", isL1Bidder: false, performanceScore: 91, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 4, vendorCode: "VND-0004", name: "M/s. Sri Srinivasa Agencies", contactEmail: "saisrinivasa123@gmail.com", contactPhone: "9391003370", address: "Flat No. 7-2-1813/5/A/1, 3rd Floor, H.No. 7-2-1813/5/A/1, 20B-348/HD/AP/2002/W, Sanathnagar, Hyderabad - 500018", gstNumber: "36ACWFS9933Q1ZO", isL1Bidder: true, performanceScore: 88, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 5, vendorCode: "VND-0005", name: "M/s. Green Apple Medical Systems", contactEmail: "greenapplemedicalsystems@gmail.com", contactPhone: "040-23400046", address: "Flat No. E310, SVSS Nivas, H.No. 7-2-1813/5/A/1, Street No.1, Czech Colony, Sanathnagar, Hyderabad - 500 018", gstNumber: "36AADAG1234B1Z3", isL1Bidder: false, performanceScore: 92, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: 6, vendorCode: "VND-0006", name: "M/s. Bhargav Enterprises", contactEmail: "bhargav.enterprises@gmail.com", contactPhone: "9848056789", address: "Himayatnagar, Hyderabad, Telangana 500029", gstNumber: "36AABFB4567C1Z1", isL1Bidder: false, performanceScore: 83, status: "active", createdAt: "2025-01-01T00:00:00Z" },
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
  { id: 1, contractNumber: "RC/TGMSIDC/EQU/2025-26/0001", equipmentId: 1, equipmentName: "Digital X-Ray Machine (DR System)", vendorId: 1, vendorName: "BPL Medical Technologies Ltd", unitPrice: 850000, gstRate: 5, warrantyYears: 3, cmcCharges: 45000, cmcStartYear: 4, status: "active", startDate: "2025-04-01", endDate: "2026-03-31", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
  { id: 2, contractNumber: "RC/TGMSIDC/EQU/2025-26/0002", equipmentId: 2, equipmentName: "ICU Ventilator", vendorId: 2, vendorName: "Siemens Healthineers India Pvt Ltd", unitPrice: 320000, gstRate: 12, warrantyYears: 2, cmcCharges: 28000, cmcStartYear: 3, status: "active", startDate: "2025-04-01", endDate: "2026-12-31", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
  { id: 3, contractNumber: "RC/TGMSIDC/EQU/2025-26/0003", equipmentId: 3, equipmentName: "Fully Automated Biochemistry Analyser", vendorId: 3, vendorName: "Nidek Medical India Pvt Ltd", unitPrice: 1200000, gstRate: 12, warrantyYears: 3, cmcCharges: 72000, cmcStartYear: 4, status: "active", startDate: "2025-04-01", endDate: "2026-09-30", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
  { id: 4, contractNumber: "RC/TGMSIDC/EQU/2025-26/0004", equipmentId: 6, equipmentName: "Surgical Diathermy / Cautery Machine", vendorId: 4, vendorName: "M/s. Sri Srinivasa Agencies", unitPrice: 185000, gstRate: 5, warrantyYears: 2, cmcCharges: 18000, cmcStartYear: 3, status: "active", startDate: "2025-04-01", endDate: "2027-03-31", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
  { id: 5, contractNumber: "RC/TGMSIDC/EQU/2025-26/0005", equipmentId: 7, equipmentName: "Mammogram Compatible CR System", vendorId: 5, vendorName: "M/s. Green Apple Medical Systems", unitPrice: 650000, gstRate: 5, warrantyYears: 3, cmcCharges: 55000, cmcStartYear: 4, status: "active", startDate: "2025-04-01", endDate: "2027-03-31", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-01T00:00:00Z" },
];

export const mockIndents: Indent[] = [
  { id: 1, indentNumber: "441A/591/TGMSIDC/EQU/2025-26", facilityId: 4, facilityName: "Govt. General Hospital, Sangareddy", equipmentId: 6, equipmentName: "Surgical Diathermy / Cautery Machine", quantity: 3, technicalRequirements: "Sigma+ model, HSN 90189099, 5% GST. Includes standard accessories: cord for mains (C020), footswitch single & double paddle, patient return electrode, monopolar handwriting pencil. Country of Origin: India", status: "po_issued", procurementMode: "rate_contract", rateContractId: 4, tenderId: null, rejectionReason: null, digitisedBy: "Clerk R. Sharma", approvedBy: "GM Equipment Wing", createdAt: "2025-12-01T09:00:00Z", updatedAt: "2026-01-11T11:00:00Z" },
  { id: 2, indentNumber: "216/418/TGMSIDC/EQU/Vemulawada/2022-23", facilityId: 5, facilityName: "Area Hospital, Vemulawada", equipmentId: 7, equipmentName: "Mammogram Compatible CR System", quantity: 1, technicalRequirements: "Fuji Film PCR Prima TM with DRY PIX Edge. For X-Ray / Radiology department. DICOM compatible. Installation and training required.", status: "po_issued", procurementMode: "rate_contract", rateContractId: 5, tenderId: null, rejectionReason: null, digitisedBy: "Clerk B. Rao", approvedBy: "GM Equipment Wing", createdAt: "2022-10-01T09:00:00Z", updatedAt: "2022-11-10T11:00:00Z" },
  { id: 3, indentNumber: "IND/TGMSIDC/EQU/WDH/2025-26/003", facilityId: 3, facilityName: "Warangal District Hospital", equipmentId: 3, equipmentName: "Fully Automated Biochemistry Analyser", quantity: 1, technicalRequirements: "≥400 tests/hr, ISE module, for new pathology lab", status: "po_issued", procurementMode: "rate_contract", rateContractId: 3, tenderId: null, rejectionReason: null, digitisedBy: "Clerk C. Verma", approvedBy: "GM Equipment Wing", createdAt: "2026-01-20T09:00:00Z", updatedAt: "2026-02-10T14:00:00Z" },
  { id: 4, indentNumber: "IND/TGMSIDC/EQU/OGH/2025-26/004", facilityId: 1, facilityName: "Osmania General Hospital", equipmentId: 5, equipmentName: "DEXA Scanner", quantity: 2, technicalRequirements: "Dual Energy X-Ray Absorptiometry for Endocrinology dept. BMD measurement, T-score/Z-score reporting. DICOM 3.0. Rate Contract period 2 years. As per TID No. 1A.67/TGMSIDC/EQU/2025-26.", status: "tender_initiated", procurementMode: "tender", rateContractId: null, tenderId: 1, rejectionReason: null, digitisedBy: "Clerk A. Sharma", approvedBy: "GM Equipment Wing", createdAt: "2025-12-15T09:00:00Z", updatedAt: "2026-01-03T09:00:00Z" },
  { id: 5, indentNumber: "IND/TGMSIDC/EQU/GH/2025-26/005", facilityId: 2, facilityName: "Gandhi Hospital", equipmentId: 2, equipmentName: "ICU Ventilator", quantity: 5, technicalRequirements: "Adult/Paediatric modes, PEEP support, for new ICU block", status: "pending_approval", procurementMode: null, rateContractId: null, tenderId: null, rejectionReason: null, digitisedBy: "Clerk B. Rao", approvedBy: null, createdAt: "2026-04-05T10:00:00Z", updatedAt: "2026-04-05T10:00:00Z" },
  { id: 6, indentNumber: "IND/TGMSIDC/EQU/NIMS/2025-26/006", facilityId: 7, facilityName: "Nizam's Institute of Medical Sciences", equipmentId: 1, equipmentName: "Digital X-Ray Machine (DR System)", quantity: 2, technicalRequirements: "Portable DR system for radiology wing. DICOM 3.0 compatible. AEC mandatory.", status: "pending_approval", procurementMode: null, rateContractId: null, tenderId: null, rejectionReason: null, digitisedBy: "Clerk D. Singh", approvedBy: null, createdAt: "2026-04-10T09:00:00Z", updatedAt: "2026-04-10T09:00:00Z" },
  { id: 7, indentNumber: "IND/TGMSIDC/EQU/CHC/KMR/2025-26/007", facilityId: 6, facilityName: "CHC Pitlam, Kamareddy", equipmentId: 8, equipmentName: "Patient Monitor (Multi-Parameter)", quantity: 4, technicalRequirements: "ECG, SpO₂, NIBP, Temp, EtCO₂; for newly constructed ward. 12.1\" colour display. Battery backup min 4 hrs.", status: "pending_approval", procurementMode: null, rateContractId: null, tenderId: null, rejectionReason: null, digitisedBy: "Clerk E. Reddy", approvedBy: null, createdAt: "2026-04-12T09:00:00Z", updatedAt: "2026-04-12T09:00:00Z" },
];

export const mockTenders: Tender[] = [
  {
    id: 1,
    tenderNumber: "1A.67/TGMSIDC/EQU/2025-26",
    indentId: 4,
    equipmentName: "DEXA Scanner",
    status: "bids_received",
    tenderInvitedDate: "2026-01-03",
    bidsReceivedDate: "2026-01-20",
    l1BidderName: null,
    l1BidderAmount: null,
    notes: "Tender ID: 662453. Published on 16.04.2025 in The Hindu (English) and Velugu (Telugu). 3 qualified bids received. Technical bids opened 20-01-2026 04:00 PM. Document verification scheduled at TGMSIDC HQ, DM&HS Campus, Koti, Hyderabad. EMD as per Annexure-1. Tender Processing Fee: ₹23,600 (incl. 18% GST). Bid Validity: 90 days.",
    createdAt: "2026-01-03T00:00:00Z",
    updatedAt: "2026-01-20T00:00:00Z",
  },
  {
    id: 2,
    tenderNumber: "3A.12/TGMSIDC/EQU/2024-25",
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
    tenderNumber: "5C.23/TGMSIDC/EQU/2025-26",
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
    poNumber: "441A/591/TGMSIDC/EQU/2025-26",
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
    deliveryAddress: "The Medical Superintendent, GGH, Sangareddy, Sangareddy - 502001, Medak Dist., Telangana",
    expectedDeliveryDate: "2026-03-01",
    actualDeliveryDate: "2026-03-14",
    cancellationReason: null,
    createdAt: "2026-01-11T10:00:00Z",
    updatedAt: "2026-03-14T12:00:00Z",
  },
  {
    id: 2,
    poNumber: "216/418/TGMSIDC/EQU/Vemulawada/2022-23",
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
    deliveryAddress: "The Medical Superintendent, Area Hospital, Vemulawada - 505 302, Rajanna Sircilla Dist., Telangana",
    expectedDeliveryDate: "2022-11-10",
    actualDeliveryDate: "2022-11-02",
    cancellationReason: null,
    createdAt: "2022-10-15T09:00:00Z",
    updatedAt: "2022-11-21T00:00:00Z",
  },
  {
    id: 3,
    poNumber: "IND/TGMSIDC/EQU/WDH/PO/2026/003",
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
    poNumber: "441A/591/TGMSIDC/EQU/2025-26",
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
    qaNotes: "All 3 main units received with complete accessories (15 line items, 45 Nos. total). Serial Nos: SP426A04AL, SP426A05L, SP426A05Q. HSN/SAC: 90189099, GST 5%. Delivery Note No. SSA/0506/25-26 dated 14-Mar-26. Received in Good Condition (GGH Sangareddy Stores stamp). Buyer Order Ref: 441A/591/TGMSIDC/EQU/2025-26 dt. 11-Mar-26. Tax Amount: NIL.",
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
    poNumber: "216/418/TGMSIDC/EQU/Vemulawada/2022-23",
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
    poNumber: "IND/TGMSIDC/EQU/WDH/PO/2026/003",
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
  { id: 1, type: "indent_approved", description: "Indent 441A/591/TGMSIDC/EQU/2025-26 approved — Surgical Diathermy linked to RC/TGMSIDC/EQU/2025-26/0004 (M/s. Sri Srinivasa Agencies)", entityId: 1, entityType: "indent", timestamp: "2026-01-11T11:00:00Z", actor: "GM Equipment Wing" },
  { id: 2, type: "po_created", description: "PO 441A/591/TGMSIDC/EQU/2025-26 issued to M/s. Sri Srinivasa Agencies for 3 Surgical Diathermy Units — GGH Sangareddy", entityId: 1, entityType: "purchase_order", timestamp: "2026-01-11T12:00:00Z", actor: "Finance Wing" },
  { id: 3, type: "qa_passed", description: "Delivery Note SSA/0506/25-26 — 45 Nos. received at GGH Sangareddy. QA 100%. Recd. in Good Condition (14-Mar-26)", entityId: 1, entityType: "delivery", timestamp: "2026-03-14T14:00:00Z", actor: "Biomedical Engineer T. Ramaiah" },
  { id: 4, type: "indent_submitted", description: "New indent IND/TGMSIDC/EQU/CHC/KMR/2025-26/007 — 4 Patient Monitors for CHC Pitlam, Kamareddy District", entityId: 7, entityType: "indent", timestamp: "2026-04-12T09:00:00Z", actor: "Clerk E. Reddy" },
  { id: 5, type: "tender_update", description: "Technical bids opened for Tender 1A.67/TGMSIDC/EQU/2025-26 (DEXA Scanner) — 3 bids received. Tender ID: 662453", entityId: 1, entityType: "tender", timestamp: "2026-01-20T16:00:00Z", actor: "Tender Cell, GM Equipment Wing" },
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
