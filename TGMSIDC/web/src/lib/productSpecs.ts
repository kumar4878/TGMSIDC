import {
  Stethoscope, Pill, Armchair, Monitor, Package, Building2,
  type LucideIcon,
} from "lucide-react";

export interface ProductCategory {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;       // tailwind text-* class
  bgColor: string;     // tailwind bg-* class
  borderColor: string; // tailwind border-* class
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { value: "medical_equipment", label: "Medical Equipment", icon: Stethoscope, color: "text-blue-700",   bgColor: "bg-blue-50",   borderColor: "border-blue-200" },
  { value: "medicines",         label: "Medicines & Drugs",  icon: Pill,         color: "text-green-700",  bgColor: "bg-green-50",  borderColor: "border-green-200" },
  { value: "furniture",         label: "Furniture & Fixtures", icon: Armchair,   color: "text-amber-700",  bgColor: "bg-amber-50",  borderColor: "border-amber-200" },
  { value: "it_hardware",       label: "IT Hardware",         icon: Monitor,      color: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200" },
  { value: "consumables",       label: "Consumables",         icon: Package,      color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  { value: "civil",             label: "Civil Works",         icon: Building2,    color: "text-slate-700",  bgColor: "bg-slate-50",  borderColor: "border-slate-200" },
];

export function getCategoryMeta(value: string): ProductCategory {
  return PRODUCT_CATEGORIES.find((c) => c.value === value) ?? PRODUCT_CATEGORIES[0];
}

export interface ProductTechSpecs {
  productCategory: string; // medical_equipment | medicines | furniture | ...
  subcategory: string;     // imaging | icu | laboratory | operation_theatre | ...
  estimatedUnitRate: number;
  general: {
    make?: string;
    model?: string;
    countryOfOrigin?: string;
    hsnCode?: string;
    standardReference?: string;
  };
  technical: {
    powerSupply?: string;
    powerConsumption?: string;
    dimensions?: string;
    weight?: string;
    operatingTemp?: string;
    humidity?: string;
    additionalFields?: Record<string, string>;
  };
  performance: Record<string, string>;
  regulatory: {
    ceMark?: boolean;
    bisIsiMark?: string;
    iecStandard?: string;
    aerbClearance?: boolean;
    iso?: string;
    pcpndtCompliance?: boolean;
  };
  accessories: string[];
  warranty: {
    years: number;
    cmcStartYear: number;
    cmcAnnualRate: number;
  };
  documentation: string[];
}

const specsStore: Record<number, ProductTechSpecs> = {
  // EQP-0001 — Digital X-Ray Machine (DR System)
  1: {
    productCategory: "medical_equipment",
    subcategory: "imaging",
    estimatedUnitRate: 850000,
    general: {
      make: "Canon / Agfa / Toshiba (HPC approved makes)",
      model: "DR-1417 / CRXDI / similar",
      countryOfOrigin: "Japan / Germany",
      hsnCode: "90221400",
      standardReference: "HPC Technical Standard TS-IMG-001",
    },
    technical: {
      powerSupply: "220–240 V AC, 50 Hz, single phase",
      powerConsumption: "Max 400 mA (40 kW generator capacity)",
      dimensions: "Detector: 43×43 cm flat panel; Control console: ~50×60×100 cm",
      weight: "Detector ≤ 5 kg; Stand ~ 120 kg",
      operatingTemp: "10°C to 40°C",
      humidity: "10%–85% RH (non-condensing)",
    },
    performance: {
      "Tube Current": "≥ 400 mA",
      "kVp Range": "40–150 kVp",
      "Detector Size": "43 × 43 cm flat-panel (FPD)",
      "Pixel Size": "≤ 150 μm",
      "DQE (Detective Quantum Efficiency)": "≥ 65% at 0 lp/mm",
      "Exposure Rate": "AEC (Automatic Exposure Control) mandatory",
      "Connectivity": "DICOM 3.0, PACS compatible",
      "Image Storage": "DICOM archive; minimum 50,000 images on-board",
    },
    regulatory: {
      ceMark: true,
      bisIsiMark: "BIS IS 7620",
      iecStandard: "IEC 60601-1, IEC 60601-1-3",
      aerbClearance: true,
    },
    accessories: [
      "Positioning sponge set (5 pieces)",
      "Anti-scatter grid (Bucky, 10:1 ratio)",
      "Lead aprons — 2 Nos. (0.5 mm Pb equivalent)",
      "Lead thyroid collar — 2 Nos.",
      "Wall bucky stand with vertical travel",
      "Control console with acquisition software",
      "DICOM CD/DVD writer",
    ],
    warranty: { years: 3, cmcStartYear: 4, cmcAnnualRate: 45000 },
    documentation: [
      "Instruction for Use (IFU) in English",
      "AERB Type Approval Certificate",
      "AERB Installation Certificate (post-installation)",
      "Factory Calibration Certificate",
      "Service Manual (soft copy)",
      "Certificate of Origin",
    ],
  },

  // EQP-0002 — ICU Ventilator
  2: {
    productCategory: "medical_equipment",
    subcategory: "icu",
    estimatedUnitRate: 320000,
    general: {
      make: "Siemens / Hamilton / Draeger / Mindray (approved)",
      model: "SERVO-i / HAMILTON-C1 / Evita / SV300 series",
      countryOfOrigin: "Germany / Switzerland / China",
      hsnCode: "90192000",
      standardReference: "HPC Technical Standard TS-ICU-002",
    },
    technical: {
      powerSupply: "100–240 V AC, 50/60 Hz; internal battery backup ≥ 4 hrs",
      powerConsumption: "≤ 200 W",
      dimensions: "~35×30×45 cm (tabletop); ~40×42×155 cm (with stand)",
      weight: "≤ 20 kg",
      operatingTemp: "5°C to 40°C",
      humidity: "15%–95% RH",
    },
    performance: {
      "Patient Type": "Adult / Paediatric / Neonatal",
      "Ventilation Modes": "Volume Control (VCV), Pressure Control (PCV), SIMV, PSV, CPAP/BiPAP",
      "FiO₂ Range": "21%–100% (blended)",
      "PEEP Range": "0–35 cmH₂O",
      "Tidal Volume": "20–2000 mL",
      "Respiratory Rate": "1–80 breaths/min",
      "Inspiratory Pressure": "0–80 cmH₂O",
      "Alarms": "High/low pressure, apnoea, O₂ failure, power failure",
    },
    regulatory: {
      ceMark: true,
      iecStandard: "IEC 60601-1, ISO 80601-2-12",
    },
    accessories: [
      "Adult breathing circuit — 2 sets",
      "Paediatric breathing circuit — 1 set",
      "HME bacterial/viral filter — 10 Nos.",
      "O₂ cell / sensor (spare)",
      "Flow sensor (spare)",
      "IV pole with roller stand",
      "User manual + quick reference card",
    ],
    warranty: { years: 2, cmcStartYear: 3, cmcAnnualRate: 28000 },
    documentation: [
      "Instruction for Use (IFU)",
      "CE Declaration of Conformity",
      "Calibration certificate",
      "Factory test report",
      "Service manual (soft copy)",
    ],
  },

  // EQP-0003 — Fully Automated Biochemistry Analyser
  3: {
    productCategory: "medical_equipment",
    subcategory: "laboratory",
    estimatedUnitRate: 1200000,
    general: {
      make: "Beckman Coulter / Siemens / Roche / Mindray (approved)",
      model: "AU480 / Dimension EXL / Cobas c311 / BS-480 series",
      countryOfOrigin: "USA / Germany / Japan / China",
      hsnCode: "90278090",
      standardReference: "HPC Technical Standard TS-LAB-003",
    },
    technical: {
      powerSupply: "220 V AC ± 10%, 50 Hz, single phase",
      powerConsumption: "≤ 1800 VA",
      dimensions: "Benchtop: ~90×65×55 cm (W×D×H)",
      weight: "≤ 80 kg",
      operatingTemp: "15°C to 32°C",
      humidity: "20%–85% RH (non-condensing)",
    },
    performance: {
      "Throughput": "≥ 400 tests/hour (photometric)",
      "Sample Types": "Serum, plasma, urine, CSF",
      "Reagent Positions": "≥ 40 on-board refrigerated (4°C ± 1°C)",
      "Sample Positions": "≥ 72 on-board",
      "ISE Module": "Na+, K+, Cl- (mandatory)",
      "Carryover": "< 0.1%",
      "LIS Interface": "HL7 / ASTM bi-directional",
      "STAT Mode": "≤ 5 minutes to first STAT result",
      "Cuvette Type": "Permanent (self-cleaning) or disposable",
    },
    regulatory: {
      ceMark: true,
      iso: "ISO 15189 / NABL accreditation compatible",
      iecStandard: "IEC 61010-1, IEC 61010-2-101",
    },
    accessories: [
      "Cuvette rotor / reaction disk (2 sets for disposable type)",
      "ISE module consumable starter kit (3 months)",
      "Reagent calibrators and controls — 3 months supply",
      "Thermal printer with paper rolls",
      "UPS (1 KVA, 30-min backup)",
      "Dedicated workstation + LIS interface cable",
    ],
    warranty: { years: 3, cmcStartYear: 4, cmcAnnualRate: 72000 },
    documentation: [
      "Instruction for Use (IFU) in English",
      "CE/IVD Declaration of Conformity",
      "Method Validation Report (for mandatory parameters)",
      "NABL compliance declaration",
      "Calibration certificate",
      "Service manual (soft copy, password-protected)",
    ],
  },

  // EQP-0004 — Ultrasound Machine (Colour Doppler)
  4: {
    productCategory: "medical_equipment",
    subcategory: "imaging",
    estimatedUnitRate: 650000,
    general: {
      make: "GE Healthcare / Philips / Samsung Medison / Mindray",
      model: "LOGIQ E10 / Affiniti 50 / HM70A / DC-60 series",
      countryOfOrigin: "USA / Netherlands / Korea",
      hsnCode: "90181200",
      standardReference: "HPC Technical Standard TS-IMG-004; PNDT Act 1994 compliant",
    },
    technical: {
      powerSupply: "100–240 V AC, 50/60 Hz; integrated battery backup ≥ 1 hr",
      powerConsumption: "≤ 350 W",
      dimensions: "Console: ~45×55×130 cm; Portable cart variant available",
      weight: "Console ≤ 40 kg; portable ≤ 8 kg",
      operatingTemp: "10°C to 40°C",
      humidity: "10%–90% RH",
    },
    performance: {
      "Imaging Modes": "B-Mode, M-Mode, Colour Doppler, Power Doppler, PW/CW Doppler",
      "Standard Probes": "3.5 MHz convex + 7.5 MHz linear (both included)",
      "Frame Rate": "≥ 25 frames/sec (real-time)",
      "Scan Depth (Convex)": "2–30 cm",
      "Spatial Resolution": "Axial ≤ 1 mm at 5 MHz",
      "DICOM Services": "DICOM 3.0 — Storage, Print, MPPS, Worklist",
      "Digital Output": "USB, DICOM, CD/DVD",
      "Measurements": "OB/GYN, Vascular, Cardiac, MSK protocols pre-loaded",
    },
    regulatory: {
      ceMark: true,
      iecStandard: "IEC 60601-1, IEC 60601-2-37",
      aerbClearance: false,
      pcpndtCompliance: true,
      bisIsiMark: "PCPNDT Form F registration mandatory at facility",
    },
    accessories: [
      "3.5 MHz convex transducer probe (abdominal/OB/GYN)",
      "7.5 MHz linear transducer probe (superficial/vascular)",
      "Ultrasound coupling gel — 5 litres",
      "DICOM media archive drive (1 TB)",
      "Thermal printer + paper rolls (12 months supply)",
      "Probe holster and probe covers",
      "Lockable storage cabinet (for probes)",
    ],
    warranty: { years: 3, cmcStartYear: 4, cmcAnnualRate: 55000 },
    documentation: [
      "Instruction for Use (IFU) in English and Telugu",
      "CE Declaration of Conformity",
      "PCPNDT Act Form F registration document",
      "AERB radiation safety declaration (diagnostic ultrasound exempt)",
      "Probe calibration certificate",
      "Service manual (soft copy)",
    ],
  },

  // EQP-0005 — DEXA Scanner
  5: {
    productCategory: "medical_equipment",
    subcategory: "imaging",
    estimatedUnitRate: 950000,
    general: {
      make: "Hologic / GE Healthcare / Lunar",
      model: "Horizon A / Discovery A / Prodigy series",
      countryOfOrigin: "USA",
      hsnCode: "90221400",
      standardReference: "HPC Technical Standard TS-IMG-005; Rate Contract 2 years — TID 1A.67/HPC/EQU/2025-26",
    },
    technical: {
      powerSupply: "220 V AC ± 10%, 50 Hz, single phase, 15A socket",
      powerConsumption: "≤ 1000 W",
      dimensions: "Scan table: 210×90×80 cm (L×W×H); Control console: 60×70×110 cm",
      weight: "Table: ~300 kg; Console: ~45 kg",
      operatingTemp: "18°C to 28°C (climate-controlled room required)",
      humidity: "20%–80% RH (non-condensing)",
      additionalFields: {
        "Room Shielding": "Not required (dose < 1 μSv/scan); AERB registration mandatory",
        "Floor Load Capacity": "≥ 500 kg/m² at scan table location",
      },
    },
    performance: {
      "Technology": "Dual Energy X-Ray Absorptiometry (DXA/DEXA)",
      "Scan Time (Lumbar Spine)": "≤ 6 minutes (standard mode)",
      "Scan Time (Proximal Femur)": "≤ 3 minutes",
      "BMD Precision (CV%)": "≤ 1% (in-vivo reproducibility)",
      "Reporting": "T-score and Z-score per WHO standards (2.5 SD threshold)",
      "Body Composition Analysis": "Whole body fat/lean mass (optional but preferred)",
      "Scan Regions": "Lumbar spine, proximal femur, forearm, whole body",
      "DICOM Services": "DICOM 3.0 — Storage, Modality Worklist",
      "Dose (Effective)": "< 1 μSv per scan (PA spine)",
    },
    regulatory: {
      ceMark: true,
      iecStandard: "IEC 60601-1, IEC 60601-1-3",
      aerbClearance: true,
      bisIsiMark: "AERB Type Approval Certificate mandatory before installation",
    },
    accessories: [
      "QC (Quality Control) phantom — spine/hip (1 set)",
      "Patient positioning cushions and bolsters",
      "Dedicated workstation with DICOM software licence",
      "Lead mat for X-ray technician (optional, dose very low)",
      "UPS (3 KVA, online, 30-min backup)",
      "Printer (A4 laser) for reports",
    ],
    warranty: { years: 3, cmcStartYear: 4, cmcAnnualRate: 85000 },
    documentation: [
      "Instruction for Use (IFU) and Operator Manual",
      "AERB Type Approval Certificate",
      "AERB Installation Permit (post-installation by vendor)",
      "Factory Calibration Certificate (pre-delivery)",
      "Daily QC procedure guide",
      "Service manual (soft copy)",
      "Certificate of Origin and CE marking certificate",
    ],
  },

  // EQP-0006 — Surgical Diathermy / Cautery Machine
  6: {
    productCategory: "medical_equipment",
    subcategory: "operation_theatre",
    estimatedUnitRate: 185000,
    general: {
      make: "Xcellance Medicaltechnologies Pvt Ltd",
      model: "Sigma+",
      countryOfOrigin: "India",
      hsnCode: "90189099",
      standardReference: "RC/HPC/EQU/2025-26/0004; GSTIN: 36AADAT9639G1Z2",
    },
    technical: {
      powerSupply: "220–240 V AC, 50 Hz",
      powerConsumption: "≤ 300 W",
      dimensions: "~32×26×14 cm (W×D×H), compact tabletop",
      weight: "≤ 5 kg",
      operatingTemp: "10°C to 40°C",
      humidity: "15%–90% RH",
    },
    performance: {
      "Output Modes": "Monopolar Cut, Monopolar Coagulation, Monopolar Blend, Bipolar Coagulation",
      "Max Output Power (Monopolar)": "350 W (cut mode)",
      "Max Output Power (Bipolar)": "80 W",
      "Frequency": "350–500 kHz",
      "Patient Return Electrode Monitor (PREM)": "Integrated — alarms on high-impedance contact",
      "Control": "Front panel buttons + foot switch (dual paddle)",
      "Activation": "Hand-controlled pencil or foot pedal (both included)",
      "Safety": "Auto cut-off on PREM impedance fault; isolated output circuit",
    },
    regulatory: {
      ceMark: true,
      bisIsiMark: "BIS IS 13530 / IEC 60601-2-2 certified",
      iecStandard: "IEC 60601-1, IEC 60601-2-2",
    },
    accessories: [
      "C020 — Cord for Mains (power cable)",
      "B029 — Footswitch Single Paddle",
      "B030 — Footswitch Double Paddle",
      "D127 — Patient Return Electrode (Silicon, reusable)",
      "D001 — Monopolar Handwriting Pencil",
      "Monopolar lead cable (instrument cord)",
      "Bipolar forceps lead cable",
    ],
    warranty: { years: 2, cmcStartYear: 3, cmcAnnualRate: 18000 },
    documentation: [
      "Instruction for Use (IFU) in English",
      "BIS/IEC compliance certificate",
      "Factory test report and calibration record",
      "GSTIN invoice with HSN 90189099",
      "Service manual (hard copy + soft copy)",
    ],
  },

  // EQP-0007 — Mammogram Compatible CR System
  7: {
    productCategory: "medical_equipment",
    subcategory: "imaging",
    estimatedUnitRate: 650000,
    general: {
      make: "Fuji Film",
      model: "FCR Prima T with DRY PIX Edge",
      countryOfOrigin: "Japan",
      hsnCode: "90221400",
      standardReference: "RC/HPC/EQU/2025-26/0005",
    },
    technical: {
      powerSupply: "220 V AC, 50 Hz",
      powerConsumption: "≤ 500 W (CR reader + dry printer combined)",
      dimensions: "CR Reader: ~35×58×80 cm; Dry Printer: ~32×43×23 cm",
      weight: "CR Reader: ~35 kg; Dry Printer: ~22 kg",
      operatingTemp: "10°C to 30°C",
      humidity: "20%–75% RH",
    },
    performance: {
      "System Type": "Computed Radiography (CR) with phosphor plate technology",
      "IP Sizes Supported": "14×17 in, 14×14 in, 10×12 in, 8×10 in",
      "Scanning Throughput": "≥ 75 plates/hour (35×43 cm)",
      "Spatial Resolution": "≥ 3.3 lp/mm (25 μm laser beam)",
      "Latitude": "≥ 10,000:1",
      "Connectivity": "DICOM 3.0 (Storage, Print, Worklist)",
      "Mammography Capability": "IQ mode for mammographic quality imaging",
      "Dry Print Format": "A4 / 14×17 thermal media (DRY PIX Edge laser printer)",
    },
    regulatory: {
      ceMark: true,
      iecStandard: "IEC 60601-1",
      aerbClearance: true,
    },
    accessories: [
      "Image Plates (IP) — 14×17 in (4 Nos.) + 14×14 in (2 Nos.)",
      "IP cassettes (matching sizes)",
      "DRY PIX Edge thermal media (14×17) — 500 sheets starter pack",
      "DICOM workstation + viewer software",
      "UPS (1 KVA, 20-min backup)",
    ],
    warranty: { years: 3, cmcStartYear: 4, cmcAnnualRate: 55000 },
    documentation: [
      "Instruction for Use (IFU)",
      "AERB Type Approval Certificate",
      "DICOM conformance statement",
      "IP cleaning and handling guide",
      "Service manual",
    ],
  },

  // EQP-0008 — Patient Monitor (Multi-Parameter)
  8: {
    productCategory: "medical_equipment",
    subcategory: "icu",
    estimatedUnitRate: 120000,
    general: {
      make: "Mindray / Philips / GE / BPL Medical",
      model: "iMEC10 / IntelliVue MX450 / CARESCAPE B450 / BPL Ultima series",
      countryOfOrigin: "China / Netherlands / USA / India",
      hsnCode: "90189099",
      standardReference: "HPC Technical Standard TS-ICU-008",
    },
    technical: {
      powerSupply: "100–240 V AC, 50/60 Hz; internal rechargeable battery ≥ 4 hrs",
      powerConsumption: "≤ 100 W",
      dimensions: "~32×26×24 cm (W×D×H); 12.1″ colour TFT screen",
      weight: "≤ 6 kg",
      operatingTemp: "0°C to 40°C",
      humidity: "15%–95% RH",
    },
    performance: {
      "Parameters (Standard)": "ECG (12-lead capable), SpO₂, NIBP, Temp (2 channels), EtCO₂",
      "ECG": "3/5/12 lead; HR 15–350 bpm; Arrhythmia analysis",
      "SpO₂": "70%–100%; motion-tolerant algorithm",
      "NIBP": "Adult/Paediatric/Neonatal mode; manual/auto/STAT",
      "Temperature": "32°C–42°C; ±0.1°C accuracy",
      "EtCO₂ (Mainstream/Sidestream)": "0–99 mmHg; RR 0–150 rpm",
      "Connectivity": "DICOM, HL7, Central station (wired/wireless)",
      "Storage": "≥ 96 hrs trend data; 500 NIBP readings",
    },
    regulatory: {
      ceMark: true,
      iecStandard: "IEC 60601-1, IEC 60601-2-49 (multi-parameter monitoring)",
    },
    accessories: [
      "ECG lead set (3-lead + 5-lead) — 1 each",
      "SpO₂ finger probe (adult, reusable) — 2 Nos.",
      "NIBP cuff set (adult + paediatric + neonatal)",
      "Temperature probe (oral/rectal/skin) — 2 Nos.",
      "EtCO₂ sensor (mainstream type) or sampling line kit (sidestream)",
      "Mounting bracket (wall/bed rail/pole)",
      "Spare battery (1 No.)",
    ],
    warranty: { years: 2, cmcStartYear: 3, cmcAnnualRate: 12000 },
    documentation: [
      "Instruction for Use (IFU)",
      "CE Declaration of Conformity",
      "Calibration certificate",
      "Nurse operator quick guide",
      "Service manual (soft copy)",
    ],
  },
  // EQP-0009 — Paracetamol 500mg Tablets IP
  9: {
    productCategory: "medicines",
    subcategory: "analgesic",
    estimatedUnitRate: 850,
    general: {
      make: "Cipla / Sun Pharma / Dr. Reddy's (DCG(I) licensed manufacturers)",
      model: "Paracetamol 500mg Tablets IP — Pack of 1000",
      countryOfOrigin: "India",
      hsnCode: "30049011",
      standardReference: "Indian Pharmacopoeia (IP) 2022, Schedule H exempt",
    },
    technical: {
      dimensions: "Blister pack: 10 tabs/strip × 100 strips per box",
      weight: "Net weight ≈ 700 g per box",
      operatingTemp: "Store below 30°C, away from light and moisture",
      humidity: "Relative humidity < 65% (storage condition)",
    },
    performance: {
      "Active Ingredient": "Paracetamol 500 mg per tablet",
      "Dosage Form": "Immediate-release oral tablet",
      "Shelf Life": "≥ 36 months from date of manufacture",
      "Dissolution": "≥ 80% in 30 min (IP Appendix XIII)",
      "Disintegration Time": "≤ 15 minutes (IP method)",
      "Packing": "Alu-Alu blister, 10 tabs/strip, printed with batch & expiry",
    },
    regulatory: {
      bisIsiMark: "IP 2022 compliant",
      iso: "WHO-GMP certified manufacturing facility",
    },
    accessories: [
      "Manufacturer's batch analysis report (CoA) for each batch",
      "Temperature-controlled dispatch packaging",
    ],
    warranty: { years: 0, cmcStartYear: 0, cmcAnnualRate: 0 },
    documentation: [
      "Certificate of Analysis (CoA) — each batch",
      "WHO-GMP certificate of manufacturer",
      "NABL-accredited lab test report for random sample check",
      "Drug licence copy (Form 20B / 21B)",
    ],
  },

  // EQP-0010 — Hospital Bed (Semi-Electric, 3-Function)
  10: {
    productCategory: "furniture",
    subcategory: "patient_furniture",
    estimatedUnitRate: 55000,
    general: {
      make: "Hospicare / Skanray / Reclined / Paramount (HPC approved)",
      model: "Semi-Electric 3-Function Hi-Lo Bed",
      countryOfOrigin: "India",
      hsnCode: "94021090",
      standardReference: "IS 14238: 2019 (Hospital Beds), HPC TS-FUR-010",
    },
    technical: {
      powerSupply: "230V AC, 50Hz for electric functions; manual backup crank",
      powerConsumption: "≤ 150 W (actuator motor)",
      dimensions: "Overall: 220×95×50–85 cm (L×W×H adjustable range)",
      weight: "Net weight ≤ 75 kg; safe working load 250 kg",
      operatingTemp: "0°C to 50°C (storage and use)",
      humidity: "10%–90% RH (non-condensing)",
    },
    performance: {
      "Backrest Range": "0°–75° (electric actuator)",
      "Leg Rest Range": "0°–30° (electric actuator)",
      "Height Adjustment": "Manual crank, 50–85 cm from floor",
      "Side Rails": "Full-length foldable ABS side rails (both sides)",
      "Castors": "4 × 125 mm with central brake and directional lock",
      "Frame": "CRCA steel, powder-coated (epoxy), corrosion-resistant",
      "Mattress Platform": "PP panel / steel mesh; perforated for ventilation",
      "IV Pole Holders": "2 Nos. — rod diameter 25 mm",
    },
    regulatory: {
      bisIsiMark: "IS 14238: 2019 compliant",
    },
    accessories: [
      "Patient positioning backrest pillow",
      "IV pole (stainless steel, 4-hook)",
      "Under-bed tray bracket (1 No.)",
      "User manual and bed maintenance card",
    ],
    warranty: { years: 2, cmcStartYear: 3, cmcAnnualRate: 3500 },
    documentation: [
      "Test certificate as per IS 14238",
      "Factory inspection report",
      "GSTIN invoice with HSN 94021090",
    ],
  },

  // EQP-0011 — Desktop Computer with Monitor (Govt. Spec)
  11: {
    productCategory: "it_hardware",
    subcategory: "desktop",
    estimatedUnitRate: 65000,
    general: {
      make: "HP / Dell / Lenovo / HCL (GEM-registered OEMs)",
      model: "Government Standard Desktop — 12th Gen i5",
      countryOfOrigin: "India (Make in India preferred)",
      hsnCode: "84714900",
      standardReference: "MeitY Govt. Desktop Spec 2023-24, GeM Cat: Desktop-Gen",
    },
    technical: {
      powerSupply: "230V AC, 50Hz; 85% efficiency SMPS",
      powerConsumption: "≤ 300 W (system + monitor combined)",
      dimensions: "Tower: 33×10×35 cm; Monitor: 21.5\" FHD IPS panel",
      weight: "Tower ≤ 8 kg; Monitor ≤ 4 kg",
      operatingTemp: "10°C to 35°C",
      humidity: "20%–80% RH",
      additionalFields: {
        "BIS Registration": "Mandatory — compulsory registration order (CRO)",
      },
    },
    performance: {
      "Processor": "Intel Core i5-12th Gen (or equivalent), ≥ 3.0 GHz base",
      "RAM": "16 GB DDR4 3200 MHz (2 × 8 GB)",
      "Storage": "512 GB NVMe SSD + 1 TB HDD",
      "Graphics": "Intel UHD integrated; optional discrete GPU",
      "Monitor": "21.5\" FHD 1920×1080, IPS, ≥ 250 nits, 5 ms response",
      "Connectivity": "USB 3.0 × 4, USB-C × 1, HDMI, RJ45 (GbE), Wi-Fi 6",
      "OS": "Windows 11 Pro (64-bit) with volume licence",
      "Warranty": "3-year onsite NBD (Next Business Day)",
    },
    regulatory: {
      bisIsiMark: "BIS CRO for IT equipment",
      iso: "ISO 9001 manufacturer; Energy Star 8.0 or BEE 4-star",
    },
    accessories: [
      "USB wired keyboard (bilingual — English + Telugu)",
      "USB optical mouse",
      "HDMI cable 1.5 m",
      "Power cable with 6A ISI-marked plug",
      "3-year onsite warranty card",
    ],
    warranty: { years: 3, cmcStartYear: 4, cmcAnnualRate: 5500 },
    documentation: [
      "BIS registration certificate (for product category)",
      "Factory test report and configuration sheet",
      "Windows licence COA (Certificate of Authenticity)",
      "GeM order confirmation / invoice",
    ],
  },

  // EQP-0012 — Sterile Surgical Gloves (Powdered, Box/100)
  12: {
    productCategory: "consumables",
    subcategory: "ppe",
    estimatedUnitRate: 1200,
    general: {
      make: "Ansell / Medline / Kanam Latex Industries (DCG(I) licensed)",
      model: "Sterile Surgical Gloves — Latex, Powdered, Size 7.0",
      countryOfOrigin: "India / Malaysia",
      hsnCode: "40151100",
      standardReference: "BIS IS 15747 / EN 455-1:2000, IP 2022",
    },
    technical: {
      dimensions: "Size 7.0 (each pair individually sterile-wrapped), box of 50 pairs",
      weight: "Net weight ≈ 550 g per box",
      operatingTemp: "Store below 25°C, dry location away from ozone sources",
      humidity: "< 65% RH (storage); avoid direct sunlight",
    },
    performance: {
      "Material": "Natural rubber latex, powdered (cornstarch)",
      "Sterility": "EO (ethylene oxide) sterilised; SAL ≤ 10⁻⁶",
      "AQL": "≤ 1.0 (pinhole test per EN 455-1)",
      "Tensile Strength": "≥ 14 N (before ageing), ≥ 10 N (after ageing)",
      "Elongation at Break": "≥ 600% (before ageing)",
      "Shelf Life": "≥ 5 years from date of manufacture",
      "Biocompatibility": "ISO 10993 compliant",
    },
    regulatory: {
      bisIsiMark: "BIS IS 15747 certification mandatory",
      iso: "ISO 13485 manufacturer QMS; EN 455 compliant",
    },
    accessories: [
      "Each pair individually peel-open sterile pouch",
      "Batch CoA certificate included per box",
    ],
    warranty: { years: 0, cmcStartYear: 0, cmcAnnualRate: 0 },
    documentation: [
      "Certificate of Analysis (CoA) — each lot",
      "BIS licence copy",
      "Sterility test certificate (random sample NABL lab)",
      "Drug licence (Form 28) for manufacturer",
    ],
  },

  // EQP-0013 — Minor Civil Works — OT Complex Renovation
  13: {
    productCategory: "civil",
    subcategory: "renovation",
    estimatedUnitRate: 2500000,
    general: {
      make: "HPC-empanelled Civil Contractors (Class I & above)",
      model: "OT Complex Renovation Package",
      countryOfOrigin: "India",
      hsnCode: "99531290",
      standardReference: "CPWD DSR 2023, MoHFW OT Guidelines 2023, HPC Civil TS-CIV-013",
    },
    technical: {
      dimensions: "Scope: 2 OTs + scrub area + sterile corridor (approx. 450 sq.m)",
      operatingTemp: "OT air temp: 18–22°C (AHU controlled); HVAC system included",
      humidity: "OT RH: 50–60% (AHU with humidistat); positive pressure",
      additionalFields: {
        "Positive Pressure": "≥ +2.5 Pa relative to adjacent corridors",
        "Air Changes": "≥ 20 ACH (Air Changes per Hour) via HEPA-filtered AHU",
        "Floor": "Antistatic, seamless epoxy terrazzo; cove skirting",
        "Walls": "Autoclaved AAC blocks, antifungal plaster, vitrified tiles",
        "Electrical": "Explosion-proof MCBs/isolators; Copper earthing ≤ 1 Ω",
      },
    },
    performance: {
      "Scope": "Demolition, civil works, MEP (electrical, plumbing, HVAC)",
      "AHU Capacity": "2 × 3000 CFM AHU units with HEPA H14 filters",
      "UPS Provision": "Double-bus 40 KVA UPS for OT equipment circuits",
      "Medical Gas": "Piped O₂, N₂O, Medical Air, Suction outlets — MGPS",
      "Lighting": "LED OT light provisions + 3200 lux min at table level",
      "Completion Schedule": "12 weeks from mobilisation (excluding monsoon breaks)",
    },
    regulatory: {
      bisIsiMark: "BIS materials compliance; CPWD DSR 2023 rates applicable",
      iso: "ISO 14644-1 Class 7 cleanroom standards for OT",
    },
    accessories: [
      "Integrated scrub station (2 taps, elbow-operated) stainless steel",
      "Provision for laminar airflow canopy over OT table",
      "UPS bypass panel and automatic changeover switch",
      "CCTV provisions inside OT (camera points only)",
    ],
    warranty: { years: 1, cmcStartYear: 2, cmcAnnualRate: 150000 },
    documentation: [
      "Detailed Project Report (DPR) with drawings",
      "Bill of Quantities (BOQ) — CPWD DSR 2023",
      "Structural stability certificate (licensed structural engineer)",
      "HVAC commissioning report and HEPA filter test certificate",
      "Completion certificate from HPC Engineer",
    ],
  },
};

export function getProductSpecs(equipmentId: string | number): ProductTechSpecs | null {
  return specsStore[Number(equipmentId)] ?? null;
}

export function updateProductSpecs(equipmentId: number, specs: ProductTechSpecs): void {
  specsStore[equipmentId] = specs;
}

export function getProductCategory(equipmentId: string | number): string {
  return specsStore[Number(equipmentId)]?.productCategory ?? "medical_equipment";
}

/** Quick one-line summary for inbox/table display */
export function getSpecSummary(equipmentId: string | number): string {
  const s = specsStore[Number(equipmentId)];
  if (!s) return "";
  const perf = Object.entries(s.performance).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join("; ");
  return perf;
}
