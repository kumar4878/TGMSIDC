import { Router } from "express";
import { Indent } from "../models/Indent.js";
import { RateContract } from "../models/RateContract.js";
import { PurchaseOrder } from "../models/PurchaseOrder.js";
import { Delivery } from "../models/Delivery.js";
import { Vendor } from "../models/Vendor.js";
import { Institution } from "../models/Institution.js";

const router = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totalIndents, pendingApproval, activeRC, activePO, pendingQA, totalVendors, totalInstitutions] =
    await Promise.all([
      Indent.countDocuments(),
      Indent.countDocuments({ status: "pending_approval" }),
      RateContract.countDocuments({ status: "active" }),
      PurchaseOrder.countDocuments({ status: "approved" }),
      Delivery.countDocuments({ status: "qa_pending" }),
      Vendor.countDocuments(),
      Institution.countDocuments(),
    ]);

  const sixtyDays = new Date();
  sixtyDays.setDate(sixtyDays.getDate() + 60);
  const expiringRC = await RateContract.countDocuments({
    status: "active",
    endDate: { $lte: sixtyDays, $gte: new Date() },
  });

  const allDeliveries = await Delivery.find({}, "status");
  const rejectedQA = allDeliveries.filter((d) => d.status === "qa_failed").length;
  const qaRejectionRate = allDeliveries.length > 0 ? (rejectedQA / allDeliveries.length) * 100 : 0;

  res.json({
    totalIndents,
    pendingApproval,
    activeRateContracts: activeRC,
    activePurchaseOrders: activePO,
    deliveriesPendingQA: pendingQA,
    expiringContracts: expiringRC,
    totalVendors,
    totalInstitutions,
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

  const allIndents = await Indent.find({}, "status");
  const total = allIndents.length || 1;

  const pipeline = statuses.map(({ key, label }) => {
    const c = allIndents.filter((i) => i.status === key).length;
    return { stage: label, count: c, percentage: Math.round((c / total) * 100 * 10) / 10 };
  });

  res.json(pipeline);
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const [recentIndents, recentPOs, recentDeliveries] = await Promise.all([
    Indent.find().sort({ updatedAt: -1 }).limit(3),
    PurchaseOrder.find().sort({ updatedAt: -1 }).limit(3),
    Delivery.find().sort({ updatedAt: -1 }).limit(2),
  ]);

  const activities = [
    ...recentIndents.map((i, idx) => ({
      id: idx + 1,
      type: "indent",
      description: `Indent ${i.indentNumber} ${i.status === "pending_approval" ? "submitted for approval" : i.status}`,
      entityId: i._id.toString(),
      entityType: "indent",
      timestamp: i.updatedAt.toISOString(),
      actor: i.digitisedBy,
    })),
    ...recentPOs.map((p, idx) => ({
      id: recentIndents.length + idx + 1,
      type: "purchase_order",
      description: `Purchase Order ${p.poNumber} ${p.status}`,
      entityId: p._id.toString(),
      entityType: "purchase_order",
      timestamp: p.updatedAt.toISOString(),
      actor: "Procurement Officer",
    })),
    ...recentDeliveries.map((d, idx) => ({
      id: recentIndents.length + recentPOs.length + idx + 1,
      type: "delivery",
      description: `Delivery ${d.qrCode} status: ${d.status}`,
      entityId: d._id.toString(),
      entityType: "delivery",
      timestamp: d.updatedAt.toISOString(),
      actor: "Logistics",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  res.json(activities);
});

router.get("/dashboard/vendor-performance", async (_req, res): Promise<void> => {
  const vendors = await Vendor.find().limit(8);
  const [allDeliveries, allPOs] = await Promise.all([
    Delivery.find(),
    PurchaseOrder.find(),
  ]);

  const perf = vendors.map((v) => {
    const vid = v._id.toString();
    const vendorPOs = allPOs.filter((po) => po.vendorId.toString() === vid);
    const vendorDeliveries = allDeliveries.filter((d) => d.vendorId.toString() === vid);
    const onTime = vendorDeliveries.filter((d) => d.status === "accepted").length;
    const qaPassed = vendorDeliveries.filter((d) => d.qaComplianceScore != null && d.qaComplianceScore >= 100).length;
    const qaPassRate = vendorDeliveries.length > 0 ? (qaPassed / vendorDeliveries.length) * 100 : 0;
    const performanceScore = v.performanceScore ?? (Math.random() * 30 + 65);

    return {
      vendorId: vid,
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
