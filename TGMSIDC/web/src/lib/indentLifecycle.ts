import { mockPurchaseOrders, mockDeliveries, mockIndents, mockInvoices } from "@/mocks/data";
import type { MockInvoice } from "@/mocks/data";
import { getSteps } from "@/lib/approvalWorkflow";
import type { PurchaseOrder, Delivery } from "@/lib/api-hooks";

export type { MockInvoice };

export type AuditEventType = "indent" | "approval" | "po" | "delivery" | "qa" | "invoice" | "grn";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  event: string;
  eventType: AuditEventType;
  entityRef?: string;
}

export interface IndentLifecycleData {
  purchaseOrders: PurchaseOrder[];
  deliveries: Delivery[];
  invoices: MockInvoice[];
  auditLog: AuditLogEntry[];
}

export function getIndentLifecycleData(indentId: string | number): IndentLifecycleData {
  const pos = mockPurchaseOrders.filter((po) => po.indentId === indentId);
  const poIds = new Set(pos.map((po) => po.id));
  const delivs = mockDeliveries.filter((d) => poIds.has(d.purchaseOrderId));
  const invoices = mockInvoices.filter((inv) => poIds.has(inv.poId));

  const indent = mockIndents.find((i) => i.id === indentId);
  const approvalSteps = getSteps(indentId);

  const log: AuditLogEntry[] = [];

  if (indent) {
    log.push({
      id: `indent-created-${indentId}`,
      timestamp: indent.createdAt,
      actor: indent.digitisedBy,
      role: "Indent Initiator",
      event: `Indent ${indent.indentNumber} raised — ${indent.equipmentName} × ${indent.quantity} for ${indent.facilityName}`,
      eventType: "indent",
      entityRef: indent.indentNumber,
    });
  }

  approvalSteps.forEach((step) => {
    if (step.actionedAt && step.status !== "pending" && step.status !== "skipped") {
      const eventLabel =
        step.status === "approved" ? "Approved" :
        step.status === "rejected" ? "Rejected" :
        step.status === "returned" ? "Returned for revision" : step.status;
      log.push({
        id: `approval-step-${indentId}-${step.stepNumber}`,
        timestamp: step.actionedAt,
        actor: step.assignedUserName,
        role: step.roleLabel,
        event: `Step ${step.stepNumber} — ${eventLabel}${step.comments ? `: ${step.comments.slice(0, 80)}${step.comments.length > 80 ? "…" : ""}` : ""}`,
        eventType: "approval",
        entityRef: `Step ${step.stepNumber}`,
      });
    }
  });

  pos.forEach((po) => {
    log.push({
      id: `po-created-${po.id}`,
      timestamp: po.createdAt,
      actor: "Finance Wing",
      role: "Finance Officer",
      event: `Purchase Order ${po.poNumber} issued — ₹${po.totalAmount.toLocaleString("en-IN")}`,
      eventType: "po",
      entityRef: po.poNumber,
    });
  });

  delivs.forEach((d) => {
    if (d.dispatchDate) {
      log.push({
        id: `delivery-dispatched-${d.id}`,
        timestamp: d.dispatchDate + "T08:00:00Z",
        actor: d.vendorName,
        role: "Vendor",
        event: `Goods dispatched — Delivery Note: ${d.qrCode}`,
        eventType: "delivery",
        entityRef: d.qrCode,
      });
    }
    if (d.deliveredDate) {
      log.push({
        id: `delivery-received-${d.id}`,
        timestamp: d.deliveredDate + "T12:00:00Z",
        actor: "Store Keeper",
        role: "Stores",
        event: `${d.quantity} unit${d.quantity !== 1 ? "s" : ""} received at ${d.facilityName}`,
        eventType: "delivery",
        entityRef: d.qrCode,
      });
    }
    if (d.qaComplianceScore !== null) {
      log.push({
        id: `qa-scored-${d.id}`,
        timestamp: d.updatedAt,
        actor: "Biomedical Engineer",
        role: "QA Officer",
        event: `QA inspection completed — Score: ${d.qaComplianceScore}%`,
        eventType: "qa",
        entityRef: d.qrCode,
      });
    }
    if (d.acceptanceCertificateIssued) {
      log.push({
        id: `grn-issued-${d.id}`,
        timestamp: d.updatedAt,
        actor: "Head of Department",
        role: "GRN Officer",
        event: `Acceptance Certificate (Annexure 6) issued and signed`,
        eventType: "grn",
        entityRef: d.qrCode,
      });
    }
  });

  invoices.forEach((inv) => {
    log.push({
      id: `invoice-${inv.id}`,
      timestamp: inv.invoiceDate + "T09:00:00Z",
      actor: inv.vendorName,
      role: "Vendor",
      event: `Invoice ${inv.invoiceNumber} submitted — ₹${inv.amount.toLocaleString("en-IN")}`,
      eventType: "invoice",
      entityRef: inv.invoiceNumber,
    });
    if (inv.paidDate) {
      log.push({
        id: `invoice-paid-${inv.id}`,
        timestamp: inv.paidDate + "T14:00:00Z",
        actor: "Finance Wing",
        role: "Finance Officer",
        event: `Payment released for Invoice ${inv.invoiceNumber}`,
        eventType: "invoice",
        entityRef: inv.invoiceNumber,
      });
    }
  });

  log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    purchaseOrders: pos,
    deliveries: delivs,
    invoices,
    auditLog: log.slice(0, 10),
  };
}

export function daysBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const diff = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
