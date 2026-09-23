import { useState, useEffect } from "react";

/** Indents with estimated total value at or above this threshold require a 4-step
 *  workflow (Initiator → BE → GM → Additional Director).
 *  Below this threshold only 3 steps are required (Initiator → BE → GM). */
export const APPROVAL_DIRECTOR_THRESHOLD = 500_000; // ₹5,00,000

export type ApprovalStepStatus = "pending" | "approved" | "rejected" | "returned" | "skipped";

export type ApprovalStepRole = "indent_initiator" | "biomedical_engineer" | "gm" | "director";

export interface ApprovalStep {
  stepNumber: number;
  requiredRole: ApprovalStepRole;
  roleLabel: string;
  assignedUserName: string;
  assignedUserId: string;
  status: ApprovalStepStatus;
  actionedAt: string | null;
  comments: string;
}

export interface ApprovalProgress {
  totalSteps: number;
  completedSteps: number;
  currentStepNumber: number;
  currentStepRole: ApprovalStepRole | null;
  isComplete: boolean;
  isRejected: boolean;
  isReturned: boolean;
}

type IndentApprovalStore = Record<string | number, ApprovalStep[]>;

const store: IndentApprovalStore = {
  1: [
    { stepNumber: 1, requiredRole: "indent_initiator", roleLabel: "Indent Initiator", assignedUserName: "Clerk R. Sharma", assignedUserId: "u1", status: "approved", actionedAt: "2025-12-01T09:00:00Z", comments: "Indent raised for GGH Sangareddy. Surgical Diathermy × 3, HSN 90189099, 5% GST." },
    { stepNumber: 2, requiredRole: "biomedical_engineer", roleLabel: "Biomedical Engineer", assignedUserName: "Er. K. Srinivas", assignedUserId: "u2", status: "approved", actionedAt: "2025-12-03T11:00:00Z", comments: "Verified technical specifications. Sigma+ model confirmed with accessories (C020, B029, B030, D127, D001). Recommend approval." },
    { stepNumber: 3, requiredRole: "gm", roleLabel: "General Manager", assignedUserName: "P. Narayan", assignedUserId: "u3", status: "approved", actionedAt: "2026-01-10T10:00:00Z", comments: "Approved. Proceed via Rate Contract RC/HPC/EQU/2025-26/0004 with M/s. Sri Srinivasa Agencies." },
    { stepNumber: 4, requiredRole: "director", roleLabel: "Additional Director", assignedUserName: "D. Venkatesh", assignedUserId: "u7", status: "approved", actionedAt: "2026-01-11T09:00:00Z", comments: "Administrative sanction accorded. Estimated value ₹5,55,000. RC route approved. Proceed." },
  ],
  2: [
    { stepNumber: 1, requiredRole: "indent_initiator", roleLabel: "Indent Initiator", assignedUserName: "Clerk B. Rao", assignedUserId: "u1", status: "approved", actionedAt: "2022-10-01T09:00:00Z", comments: "Indent for Fuji Film PCR Prima TM with DRY PIX Edge, Area Hospital Vemulawada. For X-Ray / Radiology dept." },
    { stepNumber: 2, requiredRole: "biomedical_engineer", roleLabel: "Biomedical Engineer", assignedUserName: "Er. K. Srinivas", assignedUserId: "u2", status: "approved", actionedAt: "2022-10-05T10:00:00Z", comments: "Technical specs verified. DICOM compatible CR system confirmed. Installation and training included." },
    { stepNumber: 3, requiredRole: "gm", roleLabel: "General Manager", assignedUserName: "P. Narayan", assignedUserId: "u3", status: "approved", actionedAt: "2022-10-12T14:00:00Z", comments: "Approved. Proceed via Rate Contract RC/HPC/EQU/2025-26/0005 with M/s. Green Apple Medical Systems." },
    { stepNumber: 4, requiredRole: "director", roleLabel: "Additional Director", assignedUserName: "D. Venkatesh", assignedUserId: "u7", status: "approved", actionedAt: "2022-10-14T10:00:00Z", comments: "Administrative sanction accorded. Estimated value ₹6,50,000. Proceed." },
  ],
  3: [
    { stepNumber: 1, requiredRole: "indent_initiator", roleLabel: "Indent Initiator", assignedUserName: "Clerk C. Verma", assignedUserId: "u1", status: "approved", actionedAt: "2026-01-20T09:00:00Z", comments: "Biochemistry Analyser for new pathology lab, Warangal District Hospital. Throughput ≥ 400 tests/hr required." },
    { stepNumber: 2, requiredRole: "biomedical_engineer", roleLabel: "Biomedical Engineer", assignedUserName: "Er. K. Srinivas", assignedUserId: "u2", status: "approved", actionedAt: "2026-01-23T11:00:00Z", comments: "Specs verified. ≥400 tests/hr, ISE module, 4°C on-board cooling, LIS interface — all conforming to HPC standard." },
    { stepNumber: 3, requiredRole: "gm", roleLabel: "General Manager", assignedUserName: "P. Narayan", assignedUserId: "u3", status: "approved", actionedAt: "2026-02-06T10:00:00Z", comments: "Approved via Rate Contract RC/HPC/EQU/2025-26/0003 (Nidek Medical India). PO to be raised." },
    { stepNumber: 4, requiredRole: "director", roleLabel: "Additional Director", assignedUserName: "D. Venkatesh", assignedUserId: "u7", status: "approved", actionedAt: "2026-02-08T09:00:00Z", comments: "Administrative sanction accorded. Estimated value ₹12,00,000. Proceed as per RC." },
  ],
  4: [
    { stepNumber: 1, requiredRole: "indent_initiator", roleLabel: "Indent Initiator", assignedUserName: "Clerk A. Sharma", assignedUserId: "u1", status: "approved", actionedAt: "2025-12-15T09:00:00Z", comments: "DEXA Scanner for Endocrinology dept, Osmania General Hospital. BMD measurement, DICOM 3.0. As per TID 1A.67/HPC/EQU/2025-26." },
    { stepNumber: 2, requiredRole: "biomedical_engineer", roleLabel: "Biomedical Engineer", assignedUserName: "Er. K. Srinivas", assignedUserId: "u2", status: "approved", actionedAt: "2025-12-20T10:00:00Z", comments: "Technical specs verified. BMD T-score/Z-score reporting, scan time ≤ 6 min, DICOM 3.0 confirmed. No existing RC — tender route recommended." },
    { stepNumber: 3, requiredRole: "gm", roleLabel: "General Manager", assignedUserName: "P. Narayan", assignedUserId: "u3", status: "approved", actionedAt: "2025-12-28T14:00:00Z", comments: "Approved. Tender route confirmed. TID 1A.67/HPC/EQU/2025-26 initiated." },
    { stepNumber: 4, requiredRole: "director", roleLabel: "Additional Director", assignedUserName: "D. Venkatesh", assignedUserId: "u7", status: "approved", actionedAt: "2026-01-02T10:00:00Z", comments: "Administrative sanction accorded. Value above ₹25L threshold. Tender process to proceed per GeM/e-procurement norms." },
  ],
  5: [
    { stepNumber: 1, requiredRole: "indent_initiator", roleLabel: "Indent Initiator", assignedUserName: "Clerk B. Rao", assignedUserId: "u1", status: "approved", actionedAt: "2026-04-05T10:00:00Z", comments: "5 ICU Ventilators required for new ICU block at Gandhi Hospital. Adult/Paediatric modes, PEEP support." },
    { stepNumber: 2, requiredRole: "biomedical_engineer", roleLabel: "Biomedical Engineer", assignedUserName: "Er. K. Srinivas", assignedUserId: "u2", status: "pending", actionedAt: null, comments: "" },
    { stepNumber: 3, requiredRole: "gm", roleLabel: "General Manager", assignedUserName: "P. Narayan", assignedUserId: "u3", status: "pending", actionedAt: null, comments: "" },
    { stepNumber: 4, requiredRole: "director", roleLabel: "Additional Director", assignedUserName: "D. Venkatesh", assignedUserId: "u7", status: "pending", actionedAt: null, comments: "" },
  ],
  6: [
    { stepNumber: 1, requiredRole: "indent_initiator", roleLabel: "Indent Initiator", assignedUserName: "Clerk D. Singh", assignedUserId: "u1", status: "approved", actionedAt: "2026-04-10T09:00:00Z", comments: "Portable DR system for radiology wing, NIMS. DICOM 3.0, AEC mandatory." },
    { stepNumber: 2, requiredRole: "biomedical_engineer", roleLabel: "Biomedical Engineer", assignedUserName: "Er. K. Srinivas", assignedUserId: "u2", status: "pending", actionedAt: null, comments: "" },
    { stepNumber: 3, requiredRole: "gm", roleLabel: "General Manager", assignedUserName: "P. Narayan", assignedUserId: "u3", status: "pending", actionedAt: null, comments: "" },
    { stepNumber: 4, requiredRole: "director", roleLabel: "Additional Director", assignedUserName: "D. Venkatesh", assignedUserId: "u7", status: "pending", actionedAt: null, comments: "" },
  ],
  7: [
    { stepNumber: 1, requiredRole: "indent_initiator", roleLabel: "Indent Initiator", assignedUserName: "Clerk E. Reddy", assignedUserId: "u1", status: "approved", actionedAt: "2026-04-12T09:00:00Z", comments: "4 Patient Monitors for newly constructed ward, CHC Pitlam. ECG, SpO₂, NIBP, Temp, EtCO₂." },
    { stepNumber: 2, requiredRole: "biomedical_engineer", roleLabel: "Biomedical Engineer", assignedUserName: "Er. K. Srinivas", assignedUserId: "u2", status: "pending", actionedAt: null, comments: "" },
    { stepNumber: 3, requiredRole: "gm", roleLabel: "General Manager", assignedUserName: "P. Narayan", assignedUserId: "u3", status: "pending", actionedAt: null, comments: "" },
  ],
};

export function getSteps(indentId: string | number): ApprovalStep[] {
  return store[indentId] ?? [];
}

export function getProgress(indentId: string | number): ApprovalProgress {
  const steps = getSteps(indentId);
  const total = steps.length;
  const completed = steps.filter((s) => s.status === "approved" || s.status === "skipped").length;
  const rejected = steps.some((s) => s.status === "rejected");
  const returned = steps.some((s) => s.status === "returned");

  const firstPending = steps.find((s) => s.status === "pending" || s.status === "returned");

  return {
    totalSteps: total,
    completedSteps: completed,
    currentStepNumber: firstPending?.stepNumber ?? total,
    currentStepRole: firstPending?.requiredRole ?? null,
    isComplete: completed === total && total > 0,
    isRejected: rejected,
    isReturned: returned,
  };
}

export function getActiveStepForRole(indentId: string | number, role: string): ApprovalStep | null {
  const steps = getSteps(indentId);
  const progress = getProgress(indentId);
  if (progress.isComplete || progress.isRejected) return null;
  const active = steps.find((s) => s.status === "pending" || s.status === "returned");
  if (!active) return null;
  if (active.requiredRole !== role) return null;
  return active;
}

export function getPendingIndentIdsForRole(role: string): number[] {
  return Object.keys(store)
    .map(Number)
    .filter((id) => getActiveStepForRole(id, role) !== null);
}

type StoreListener = () => void;
const listeners = new Set<StoreListener>();

export function subscribeToApprovalStore(listener: StoreListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  listeners.forEach((fn) => fn());
}

export function updateStep(
  indentId: string | number,
  stepNumber: number,
  update: { status: ApprovalStepStatus; comments: string; actionedAt: string }
): ApprovalStep[] {
  const steps = store[indentId];
  if (!steps) return [];
  const idx = steps.findIndex((s) => s.stepNumber === stepNumber);
  if (idx === -1) return steps;
  steps[idx] = { ...steps[idx], ...update };
  store[indentId] = [...steps];
  notifyListeners();
  return store[indentId];
}

export function initStepsForNewIndent(indentId: string | number, initiatorName: string, isHighValue: boolean): ApprovalStep[] {
  const baseSteps: ApprovalStep[] = [
    { stepNumber: 1, requiredRole: "indent_initiator", roleLabel: "Indent Initiator", assignedUserName: initiatorName, assignedUserId: "u1", status: "approved", actionedAt: new Date().toISOString(), comments: "Indent submitted." },
    { stepNumber: 2, requiredRole: "biomedical_engineer", roleLabel: "Biomedical Engineer", assignedUserName: "Er. K. Srinivas", assignedUserId: "u2", status: "pending", actionedAt: null, comments: "" },
    { stepNumber: 3, requiredRole: "gm", roleLabel: "General Manager", assignedUserName: "P. Narayan", assignedUserId: "u3", status: "pending", actionedAt: null, comments: "" },
  ];
  if (isHighValue) {
    baseSteps.push({ stepNumber: 4, requiredRole: "director", roleLabel: "Additional Director", assignedUserName: "D. Venkatesh", assignedUserId: "u7", status: "pending", actionedAt: null, comments: "" });
  }
  store[indentId] = baseSteps;
  notifyListeners();
  return baseSteps;
}

/** React hook: returns the live count of indents awaiting action for `role`.
 *  Re-renders automatically whenever any approval step is updated or a new
 *  indent is created — no polling needed. */
export function useApprovalPendingCount(role: string): number {
  const [count, setCount] = useState(() => getPendingIndentIdsForRole(role).length);

  useEffect(() => {
    // Recompute immediately in case role changed
    setCount(getPendingIndentIdsForRole(role).length);
    const unsubscribe = subscribeToApprovalStore(() => {
      setCount(getPendingIndentIdsForRole(role).length);
    });
    return unsubscribe;
  }, [role]);

  return count;
}

