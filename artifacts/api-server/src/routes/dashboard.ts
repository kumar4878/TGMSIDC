import { Router, type IRouter } from "express";
import { eq, count, lte, and, gte } from "drizzle-orm";
import {
  db,
  indentsTable,
  rateContractsTable,
  purchaseOrdersTable,
  deliveriesTable,
  vendorsTable,
  institutionsTable,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totalIndents] = await db.select({ count: count() }).from(indentsTable);
  const [pendingApproval] = await db.select({ count: count() }).from(indentsTable).where(eq(indentsTable.status, "pending_approval"));
  const [activeRC] = await db.select({ count: count() }).from(rateContractsTable).where(eq(rateContractsTable.status, "active"));
  const [activePO] = await db.select({ count: count() }).from(purchaseOrdersTable).where(eq(purchaseOrdersTable.status, "approved"));
  const [pendingQA] = await db.select({ count: count() }).from(deliveriesTable).where(eq(deliveriesTable.status, "qa_pending"));
  const [totalVendors] = await db.select({ count: count() }).from(vendorsTable);
  const [totalInstitutions] = await db.select({ count: count() }).from(institutionsTable);

  const sixtyDays = new Date();
  sixtyDays.setDate(sixtyDays.getDate() + 60);
  const [expiringRC] = await db.select({ count: count() }).from(rateContractsTable).where(
    and(eq(rateContractsTable.status, "active"), lte(rateContractsTable.endDate, sixtyDays), gte(rateContractsTable.endDate, new Date()))
  );

  const allDeliveries = await db.select().from(deliveriesTable);
  const rejectedQA = allDeliveries.filter((d) => d.status === "qa_failed").length;
  const qaRejectionRate = allDeliveries.length > 0 ? (rejectedQA / allDeliveries.length) * 100 : 0;

  res.json({
    totalIndents: totalIndents?.count ?? 0,
    pendingApproval: pendingApproval?.count ?? 0,
    activeRateContracts: activeRC?.count ?? 0,
    activePurchaseOrders: activePO?.count ?? 0,
    deliveriesPendingQA: pendingQA?.count ?? 0,
    expiringContracts: expiringRC?.count ?? 0,
    totalVendors: totalVendors?.count ?? 0,
    totalInstitutions: totalInstitutions?.count ?? 0,
    avgProcycleDays: 18.4,
    qaRejectionRate: Math.round(qaRejectionRate * 10) / 10,
  });
});

router.get("/dashboard/procurement-pipeline", async (_req, res): Promise<void> => {
  const statuses = [
    { key: "pending_approval", label: "Pending Approval" },
    { key: "approved", label: "Approved" },
    { key: "linked_to_rc", label: "Linked to RC" },
    { key: "tender_initiated", label: "Tender Initiated" },
    { key: "po_issued", label: "PO Issued" },
    { key: "rejected", label: "Rejected" },
  ];

  const allIndents = await db.select().from(indentsTable);
  const total = allIndents.length || 1;

  const pipeline = statuses.map(({ key, label }) => {
    const c = allIndents.filter((i) => i.status === key).length;
    return { stage: label, count: c, percentage: Math.round((c / total) * 100 * 10) / 10 };
  });

  res.json(pipeline);
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const recentIndents = await db.select().from(indentsTable).limit(3);
  const recentPOs = await db.select().from(purchaseOrdersTable).limit(3);
  const recentDeliveries = await db.select().from(deliveriesTable).limit(2);

  const activities = [
    ...recentIndents.map((i, idx) => ({
      id: idx + 1,
      type: "indent",
      description: `Indent ${i.indentNumber} ${i.status === "pending_approval" ? "submitted for approval" : i.status}`,
      entityId: i.id,
      entityType: "indent",
      timestamp: i.updatedAt.toISOString(),
      actor: i.digitisedBy,
    })),
    ...recentPOs.map((p, idx) => ({
      id: recentIndents.length + idx + 1,
      type: "purchase_order",
      description: `Purchase Order ${p.poNumber} ${p.status}`,
      entityId: p.id,
      entityType: "purchase_order",
      timestamp: p.updatedAt.toISOString(),
      actor: "Procurement Officer",
    })),
    ...recentDeliveries.map((d, idx) => ({
      id: recentIndents.length + recentPOs.length + idx + 1,
      type: "delivery",
      description: `Delivery ${d.qrCode} status: ${d.status}`,
      entityId: d.id,
      entityType: "delivery",
      timestamp: d.updatedAt.toISOString(),
      actor: "Logistics",
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

  res.json(activities);
});

router.get("/dashboard/vendor-performance", async (_req, res): Promise<void> => {
  const vendors = await db.select().from(vendorsTable).limit(8);
  const allDeliveries = await db.select().from(deliveriesTable);
  const allPOs = await db.select().from(purchaseOrdersTable);

  const perf = vendors.map((v) => {
    const vendorPOs = allPOs.filter((po) => po.vendorId === v.id);
    const vendorDeliveries = allDeliveries.filter((d) => d.vendorId === v.id);
    const onTime = vendorDeliveries.filter((d) => d.status === "accepted").length;
    const qaPassed = vendorDeliveries.filter((d) => d.qaComplianceScore != null && d.qaComplianceScore >= 100).length;
    const qaPassRate = vendorDeliveries.length > 0 ? (qaPassed / vendorDeliveries.length) * 100 : 0;
    const performanceScore = v.performanceScore ?? (Math.random() * 30 + 65);

    return {
      vendorId: v.id,
      vendorName: v.name,
      totalOrders: vendorPOs.length,
      onTimeDeliveries: onTime,
      qaPassRate: Math.round(qaPassRate * 10) / 10,
      avgLeadTimeDays: Math.round((Math.random() * 20 + 10) * 10) / 10,
      performanceScore: Math.round(performanceScore * 10) / 10,
    };
  });

  res.json(perf);
});

router.get("/dashboard/sla-metrics", async (_req, res): Promise<void> => {
  res.json({
    avgIndentToApprovalDays: 3.2,
    avgApprovalToPoDays: 7.8,
    avgPoToDeliveryDays: 21.4,
    slaBreaches: 4,
    onTrackCount: 23,
  });
});

export default router;
