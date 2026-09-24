import { useRoute, Link } from "wouter";
import { useGetIndent, getGetIndentQueryKey } from "@/lib/api-hooks";
import { BASE_URL } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { getSteps, getActiveStepForRole } from "@/lib/approvalWorkflow";
import type { ApprovalStep } from "@/lib/approvalWorkflow";
import { ProductSpecSheet } from "@/components/ProductSpecSheet";
import { getCategoryMeta, getSpecSummary } from "@/lib/productSpecs";
import {
  ArrowLeft, Building2, Wrench, User, Calendar, FileText,
  AlertCircle, CheckCircle2, XCircle, RotateCcw, Clock,
  ChevronRight, ShieldCheck, GitBranch, IndianRupee,
  Package, Truck, Receipt, ClipboardCheck, History, Layers,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getIndentLifecycleData, daysBetween } from "@/lib/indentLifecycle";
import type { AuditEventType } from "@/lib/indentLifecycle";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STEP_ROLE_COLOR: Record<string, string> = {
  indent_initiator: "bg-blue-100 text-blue-700 border-blue-200",
  biomedical_engineer: "bg-violet-100 text-violet-700 border-violet-200",
  gm: "bg-emerald-100 text-emerald-700 border-emerald-200",
  director: "bg-amber-100 text-amber-700 border-amber-200",
};

const STEP_STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Approved" },
  rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Rejected" },
  returned: { icon: RotateCcw, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Returned" },
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/40 border-border", label: "Pending" },
  skipped: { icon: ChevronRight, color: "text-muted-foreground", bg: "bg-muted/20 border-border", label: "Skipped" },
};

const PROCURE_MODE_OPTIONS = [
  { value: "rate_contract", label: "Rate Contract — Use existing approved RC (fast-track)" },
  { value: "tender", label: "Open Tender — Invite bids via GeM / e-Procurement" },
  { value: "limited_tender", label: "Limited Tender — Pre-qualified vendors only" },
  { value: "single_source", label: "Single Source — Proprietary / Emergency purchase" },
];

function stepKey(id: string) {
  return ["indent-approval-steps", id] as const;
}

function ApprovalTimeline({ steps, activeStepNumber }: { steps: ApprovalStep[]; activeStepNumber: number }) {
  return (
    <div className="relative">
      {steps.map((step, idx) => {
        const cfg = STEP_STATUS_CONFIG[step.status] ?? STEP_STATUS_CONFIG.pending;
        const Icon = cfg.icon;
        const isActive = step.stepNumber === activeStepNumber && step.status === "pending";
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.stepNumber} className="flex gap-4">
            <div className="flex flex-col items-center shrink-0">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 shrink-0",
                step.status === "approved" ? "bg-emerald-500 border-emerald-500 text-white" :
                step.status === "rejected" ? "bg-red-500 border-red-500 text-white" :
                step.status === "returned" ? "bg-amber-400 border-amber-400 text-white" :
                isActive ? "bg-white border-primary animate-pulse" : "bg-muted border-border"
              )}>
                {step.status === "approved" ? <CheckCircle2 className="h-4 w-4" /> :
                 step.status === "rejected" ? <XCircle className="h-4 w-4" /> :
                 step.status === "returned" ? <RotateCcw className="h-4 w-4" /> :
                 isActive ? <div className="h-2.5 w-2.5 rounded-full bg-primary" /> :
                 <span className="text-xs font-bold text-muted-foreground">{step.stepNumber}</span>}
              </div>
              {!isLast && (
                <div className={cn("w-0.5 flex-1 my-0.5", step.status === "approved" ? "bg-emerald-300" : "bg-border")} style={{ minHeight: "2rem" }} />
              )}
            </div>

            <div className={cn("flex-1 rounded-lg border p-3 mb-3", cfg.bg, isActive && "border-primary/40 bg-primary/5 shadow-sm")}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">Step {step.stepNumber}</span>
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", STEP_ROLE_COLOR[step.requiredRole])}>
                    {step.roleLabel}
                  </Badge>
                  {isActive && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border border-primary/30">
                      Awaiting Action
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                  <span className={cn("text-xs font-medium", cfg.color)}>{cfg.label}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-foreground mt-1">{step.assignedUserName}</p>
              {step.actionedAt && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {format(new Date(step.actionedAt), "dd MMM yyyy, HH:mm")} · {formatDistanceToNow(new Date(step.actionedAt), { addSuffix: true })}
                </p>
              )}
              {step.comments && (
                <p className="text-xs text-foreground/80 mt-1.5 italic border-t border-border/50 pt-1.5">
                  "{step.comments}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function IndentDetail() {
  const [, params] = useRoute("/indents/:id");
  const id = (params?.id ?? "");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: indent, isLoading } = useGetIndent(id, {
    query: { enabled: !!id, queryKey: getGetIndentQueryKey(id) },
  });

  const { data: steps = [], refetch: refetchSteps } = useQuery({
    queryKey: stepKey(id),
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/indents/${id}/approval-steps`);
      return res.json() as Promise<ApprovalStep[]>;
    },
    enabled: !!id,
  });

  const [comments, setComments] = useState("");
  const [procurementMode, setProcurementMode] = useState("rate_contract");
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [specProduct, setSpecProduct] = useState<{ equipmentId: number; name: string } | null>(null);

  const steps_live = (steps.length > 0) ? steps : ((indent?.approvalSteps && indent.approvalSteps.length > 0) ? indent.approvalSteps : getSteps(id));
  const progress_live = steps_live.length > 0 ? (() => {
    const total = steps_live.length;
    const completed = steps_live.filter((s: ApprovalStep) => s.status === "approved" || s.status === "skipped").length;
    const firstPending = steps_live.find((s: ApprovalStep) => s.status === "pending" || s.status === "returned");
    return {
      totalSteps: total,
      completedSteps: completed,
      currentStepNumber: firstPending?.stepNumber ?? total,
      currentStepRole: firstPending?.requiredRole ?? null,
      isComplete: completed === total && total > 0,
      isRejected: steps_live.some((s: ApprovalStep) => s.status === "rejected"),
      isReturned: steps_live.some((s: ApprovalStep) => s.status === "returned"),
    };
  })() : { totalSteps: 0, completedSteps: 0, currentStepNumber: 0, currentStepRole: null, isComplete: false, isRejected: false, isReturned: false };

  const firstPendingStep = steps_live.find(
    (s: ApprovalStep) => s.status === "pending" || s.status === "returned"
  ) ?? null;
  const pendingStep = firstPendingStep?.requiredRole === user.role ? firstPendingStep : null;

  const stepMutation = useMutation({
    mutationFn: async (payload: {
      stepNumber: number;
      status: "approved" | "rejected" | "returned";
      comments: string;
      procurementMode?: string;
    }) => {
      setProcessing(true);
      const res = await fetch(`${BASE_URL}/indents/${id}/approval-steps/${payload.stepNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: payload.status,
          comments: payload.comments,
          approvedBy: user.name,
          procurementMode: payload.procurementMode,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      refetchSteps();
      queryClient.invalidateQueries({ queryKey: getGetIndentQueryKey(id) });
      setComments("");
      setProcessing(false);
    },
    onError: () => setProcessing(false),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" /></div>;
  }
  if (!indent) {
    return <div className="text-center py-20 text-muted-foreground">Indent not found</div>;
  }

  const lineItems = indent.lineItems ?? [];
  const hasLineItems = lineItems.length > 0;
  const totalEstimated = lineItems.reduce((sum: number, li: any) => sum + li.qty * li.estimatedUnitRate, 0);

  const lifecycleData = getIndentLifecycleData(id);
  const { purchaseOrders: linkedPOs, deliveries: linkedDeliveries, invoices: linkedInvoices, auditLog } = lifecycleData;

  const firstDeliveredDelivery = linkedDeliveries.find((d) => d.deliveredDate);
  const firstQAPassedDelivery = linkedDeliveries.find((d) => d.status === "qa_passed" || d.status === "accepted");
  const firstAcceptedDelivery = linkedDeliveries.find((d) => d.acceptanceCertificateIssued);

  const LIFECYCLE_STAGES = [
    "Indent Raised", "Approved", "PO Issued", "Delivered", "QA Passed", "Accepted",
  ] as const;

  const stageTimestamps: (string | null)[] = [
    indent.createdAt,
    (indent.approvedBy || !["pending_approval", "rejected"].includes(indent.status)) ? indent.updatedAt : null,
    linkedPOs.length > 0 ? linkedPOs[0].createdAt : null,
    firstDeliveredDelivery?.deliveredDate ? firstDeliveredDelivery.deliveredDate + "T12:00:00Z" : null,
    firstQAPassedDelivery?.updatedAt ?? null,
    firstAcceptedDelivery?.updatedAt ?? null,
  ];

  const activeStageIdx = (() => {
    if (firstAcceptedDelivery) return 5;
    if (firstQAPassedDelivery) return 4;
    if (firstDeliveredDelivery) return 3;
    if (linkedPOs.length > 0) return 2;
    if (indent.approvedBy || !["pending_approval", "rejected"].includes(indent.status)) return 1;
    return 0;
  })();

  const lifecycleIsRejected = indent.status === "rejected";

  const totalPOValue = linkedPOs.reduce((s, p) => s + p.totalAmount, 0);
  const totalInvoiced = linkedInvoices.reduce((s, i) => s + i.amount, 0);
  const grnCount = linkedDeliveries.filter((d) => d.acceptanceCertificateIssued).length;
  const allInvoicesPaid = linkedInvoices.length > 0 && linkedInvoices.every((i) => i.status === "paid");

  const AUDIT_EVENT_COLORS: Record<AuditEventType, string> = {
    indent:   "bg-blue-100 text-blue-700 border-blue-200",
    approval: "bg-violet-100 text-violet-700 border-violet-200",
    po:       "bg-emerald-100 text-emerald-700 border-emerald-200",
    delivery: "bg-sky-100 text-sky-700 border-sky-200",
    qa:       "bg-amber-100 text-amber-700 border-amber-200",
    invoice:  "bg-indigo-100 text-indigo-700 border-indigo-200",
    grn:      "bg-teal-100 text-teal-700 border-teal-200",
  };

  const formatINR = (n: number) =>
    n >= 10_00_000
      ? `₹${(n / 10_00_000).toFixed(2)} Cr`
      : n >= 1_00_000
      ? `₹${(n / 1_00_000).toFixed(2)} L`
      : `₹${n.toLocaleString("en-IN")}`;


  function handleAction(action: "approved" | "returned") {
    if (!pendingStep) return;
    if (action === "returned" && !comments.trim()) return;
    const isLastStep = pendingStep.stepNumber === progress_live.totalSteps;
    stepMutation.mutate({
      stepNumber: pendingStep.stepNumber,
      status: action,
      comments: comments.trim() || "Approved.",
      procurementMode: (action === "approved" && isLastStep) || (action === "approved" && pendingStep.requiredRole === "gm" && progress_live.totalSteps <= 3)
        ? procurementMode
        : undefined,
    });
  }

  const isGmOrDirectorFinalStep = pendingStep && (
    (pendingStep.requiredRole === "gm" && progress_live.totalSteps === 3) ||
    (pendingStep.requiredRole === "director" && pendingStep.stepNumber === progress_live.totalSteps)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/indents">
          <Button variant="ghost" size="sm" className="gap-2 mt-0.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold font-mono">{indent.indentNumber}</h1>
            <StatusBadge status={indent.status} />
            {progress_live.totalSteps > 0 && (
              <Badge variant="outline" className="text-xs gap-1 font-normal">
                <GitBranch className="h-3 w-3" />
                Step {Math.min(progress_live.completedSteps + 1, progress_live.totalSteps)} of {progress_live.totalSteps}
              </Badge>
            )}
            {hasLineItems && lineItems.length > 1 && (
              <Badge variant="secondary" className="text-xs gap-1">
                {lineItems.length} line items
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Procurement Indent · {indent.facilityName}</p>
        </div>
      </div>

      {/* Procurement Status Banner */}
      <Card>
        <CardContent className="pt-4 pb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Procurement Lifecycle
            </p>
            {lifecycleIsRejected && (
              <Badge variant="outline" className="text-xs border-red-300 text-red-600 bg-red-50">Rejected</Badge>
            )}
          </div>
          <div className="flex items-start">
            {LIFECYCLE_STAGES.map((stage, i) => {
              const done = !lifecycleIsRejected && i <= activeStageIdx;
              const active = !lifecycleIsRejected && i === activeStageIdx;
              const ts = stageTimestamps[i];
              const prevTs = i > 0 ? stageTimestamps[i - 1] : null;
              const days = done && i > 0 ? daysBetween(prevTs, ts) : null;
              return (
                <div key={stage} className="flex items-start flex-1 last:flex-none min-w-0">
                  <div className="flex flex-col items-center min-w-0 shrink-0">
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors shrink-0",
                      lifecycleIsRejected && i > 0
                        ? "bg-muted border-border text-muted-foreground"
                        : done
                        ? "bg-primary border-primary text-white"
                        : "bg-muted border-border text-muted-foreground"
                    )}>
                      {done && !lifecycleIsRejected ? "✓" : i + 1}
                    </div>
                    <span className={cn(
                      "text-[11px] mt-1 text-center leading-tight px-0.5",
                      done ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {stage}
                    </span>
                    {ts && done && (
                      <span className="text-[10px] text-muted-foreground mt-0.5 text-center">
                        {format(new Date(ts), "dd MMM yy")}
                      </span>
                    )}
                    {active && !ts && (
                      <span className="text-[10px] text-primary mt-0.5 font-medium">Active</span>
                    )}
                  </div>
                  {i < LIFECYCLE_STAGES.length - 1 && (
                    <div className="flex flex-col items-center flex-1 pt-3 px-0.5">
                      <div className={cn(
                        "h-0.5 w-full transition-colors",
                        done && !lifecycleIsRejected ? "bg-primary" : "bg-muted"
                      )} />
                      {days !== null && days >= 0 && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{days}d</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rejection notice */}
      {indent.status === "rejected" && indent.rejectionReason && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Indent Rejected</p>
            <p className="text-sm text-red-700 mt-0.5">{indent.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-4">

          {/* Top info row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Indent Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={Building2} label="Requesting Facility" value={indent.facilityName} />
                <InfoRow icon={User} label="Digitised By" value={indent.digitisedBy} />
                <InfoRow icon={Calendar} label="Submitted" value={format(new Date(indent.createdAt), "dd MMM yyyy, HH:mm")} />
                {hasLineItems && (
                  <div className="flex items-start gap-3">
                    <IndianRupee className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Estimated Value</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{formatINR(totalEstimated)}</p>
                    </div>
                  </div>
                )}
                {!hasLineItems && (
                  <>
                    <InfoRow icon={Wrench} label="Equipment" value={indent.equipmentName} />
                    <InfoRow icon={FileText} label="Quantity" value={String(indent.quantity)} />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Procurement Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {indent.procurementMode ? (
                  <InfoRow icon={FileText} label="Mode" value={PROCURE_MODE_OPTIONS.find(o => o.value === indent.procurementMode)?.label.split(" — ")[0] ?? indent.procurementMode} />
                ) : (
                  <p className="text-xs text-muted-foreground">Pending GM approval</p>
                )}
                {indent.approvedBy && <InfoRow icon={User} label="Approved By" value={indent.approvedBy} />}
                {indent.rateContractId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Linked Rate Contract</p>
                    <Link href={`/rate-contracts/${indent.rateContractId}`}>
                      <span className="block text-sm text-primary font-medium mt-0.5 hover:underline">View Rate Contract →</span>
                    </Link>
                  </div>
                )}
                {indent.tenderId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Linked Tender</p>
                    <Link href={`/tenders/${indent.tenderId}`}>
                      <span className="block text-sm text-primary font-medium mt-0.5 hover:underline">View Tender →</span>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Requested Products / Line Items ── */}
          {hasLineItems ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Requested Products</CardTitle>
                  <span className="text-xs text-muted-foreground">{lineItems.length} line item{lineItems.length !== 1 ? "s" : ""}</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs w-8">#</th>
                        <th className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs">Category</th>
                        <th className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs">Product</th>
                        <th className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs">Justification</th>
                        <th className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs">Spec Summary</th>
                        <th className="px-3 py-2.5 text-right font-medium text-muted-foreground text-xs">Qty</th>
                        <th className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs">Unit</th>
                        <th className="px-3 py-2.5 text-right font-medium text-muted-foreground text-xs">Est. Unit Rate</th>
                        <th className="px-3 py-2.5 text-right font-medium text-muted-foreground text-xs">Est. Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((li: any, idx: number) => {
                        const catMeta = getCategoryMeta(li.category);
                        const CatIcon = catMeta.icon;
                        return (
                          <tr key={`${li.equipmentId}-${idx}`} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                            <td className="px-3 py-3 text-xs text-muted-foreground">{idx + 1}</td>
                            <td className="px-3 py-3">
                              <span className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border",
                                catMeta.bgColor, catMeta.color, catMeta.borderColor
                              )}>
                                <CatIcon className="h-2.5 w-2.5" />
                                {catMeta.label}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                className="text-left font-medium text-primary hover:underline underline-offset-2 transition-colors"
                                onClick={() => setSpecProduct({ equipmentId: li.equipmentId, name: li.equipmentName })}
                              >
                                {li.equipmentName}
                              </button>
                            </td>
                            <td className="px-3 py-3 max-w-[180px]">
                              <p className="text-xs text-foreground/80 line-clamp-3">{li.justification || "—"}</p>
                            </td>
                            <td className="px-3 py-3 max-w-[180px]">
                              <p className="text-xs text-muted-foreground line-clamp-2">{getSpecSummary(li.equipmentId)}</p>
                            </td>
                            <td className="px-3 py-3 text-right font-semibold tabular-nums">{li.qty}</td>
                            <td className="px-3 py-3 text-xs text-muted-foreground">{li.unit}</td>
                            <td className="px-3 py-3 text-right tabular-nums text-sm">₹{li.estimatedUnitRate.toLocaleString("en-IN")}</td>
                            <td className="px-3 py-3 text-right font-semibold tabular-nums text-sm">{formatINR(li.qty * li.estimatedUnitRate)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-muted/20">
                        <td colSpan={8} className="px-3 py-2.5 text-right font-semibold text-sm">Total Estimated Value</td>
                        <td className="px-3 py-2.5 text-right font-bold text-base tabular-nums">{formatINR(totalEstimated)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Technical Requirements</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{indent.technicalRequirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Panel */}
          {pendingStep && indent.status === "pending_approval" && (
            <Card className="border-primary/40 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base text-primary">
                    {pendingStep.requiredRole === "biomedical_engineer" && "Technical Review — Biomedical Engineer"}
                    {pendingStep.requiredRole === "gm" && "GM Approval — General Manager"}
                    {pendingStep.requiredRole === "director" && "Administrative Sanction — Additional Director"}
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Step {pendingStep.stepNumber} of {progress_live.totalSteps} · Assigned to {pendingStep.assignedUserName}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGmOrDirectorFinalStep && pendingStep.status !== "returned" && (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Procurement Mode *</Label>
                    <Select value={procurementMode} onValueChange={setProcurementMode}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROCURE_MODE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {procurementMode === "tender" && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-1">
                        Approving via Open Tender will initiate the tender preparation workflow. A TID will be assigned and the procurement team notified.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    {pendingStep.status === "returned" ? "Resubmission Notes" : "Comments / Observations"}
                    <span className="text-red-500 ml-0.5">*</span>
                    <span className="text-muted-foreground font-normal ml-1">(required for Return / Reject)</span>
                  </Label>
                  <Textarea
                    placeholder={
                      pendingStep.requiredRole === "biomedical_engineer"
                        ? "Technical findings, specification conformance notes, recommendations…"
                        : pendingStep.requiredRole === "gm"
                        ? "Approval rationale, budget remarks, procurement mode justification…"
                        : "Administrative sanction notes, value concurrence, special conditions…"
                    }
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-2 flex-wrap pt-1">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                    onClick={() => handleAction("approved")}
                    disabled={processing}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {processing ? "Processing..." :
                      pendingStep.requiredRole === "biomedical_engineer" ? "Recommend Approval" :
                      pendingStep.requiredRole === "director" ? "Accord Sanction" :
                      "Approve Indent"}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-40"
                    onClick={() => handleAction("returned")}
                    disabled={processing || !comments.trim()}
                    title={!comments.trim() ? "Enter a revision reason before returning" : undefined}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Return for Revision
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => setRejectDialog(true)}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Approval timeline */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Approval Timeline</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {progress_live.completedSteps}/{progress_live.totalSteps} steps
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress_live.totalSteps > 0 ? (progress_live.completedSteps / progress_live.totalSteps) * 100 : 0}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              {steps_live.length > 0 ? (
                <ApprovalTimeline steps={steps_live} activeStepNumber={progress_live.currentStepNumber} />
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Loading approval steps…</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Documents */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Related Documents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Purchase Orders card */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Purchase Orders</p>
                  <p className="text-[11px] text-muted-foreground">{linkedPOs.length} PO{linkedPOs.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {linkedPOs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No POs issued yet</p>
              ) : (
                <>
                  <p className="text-sm font-semibold tabular-nums mb-2">{formatINR(totalPOValue)}</p>
                  <div className="flex flex-wrap gap-1">
                    {linkedPOs.map((po) => (
                      <Link key={po.id} href={`/purchase-orders/${po.id}`}>
                        <span className="inline-block text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 rounded px-1.5 py-0.5 hover:bg-emerald-100 transition-colors cursor-pointer">
                          {po.poNumber.length > 18 ? po.poNumber.slice(0, 18) + "…" : po.poNumber}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Deliveries card */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                  <Truck className="h-4 w-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Deliveries</p>
                  <p className="text-[11px] text-muted-foreground">{linkedDeliveries.length} shipment{linkedDeliveries.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {linkedDeliveries.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No deliveries recorded</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {linkedDeliveries.map((d) => (
                      <Link key={d.id} href={`/deliveries/${d.id}`}>
                        <span className={cn(
                          "inline-block text-[10px] font-mono rounded px-1.5 py-0.5 border hover:opacity-80 transition-opacity cursor-pointer",
                          d.status === "accepted" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                          d.status === "qa_passed" ? "bg-teal-50 border-teal-200 text-teal-700" :
                          d.status === "qa_pending" ? "bg-amber-50 border-amber-200 text-amber-700" :
                          "bg-sky-50 border-sky-200 text-sky-700"
                        )}>
                          {d.qrCode}
                        </span>
                      </Link>
                    ))}
                  </div>
                  {linkedDeliveries.some((d) => d.qaComplianceScore !== null) && (
                    <p className="text-xs text-muted-foreground">
                      QA: {linkedDeliveries.filter((d) => (d.qaComplianceScore ?? 0) >= 100).length}/{linkedDeliveries.length} passed
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* GRN / Installation card */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">GRN / Installation</p>
                  <p className="text-[11px] text-muted-foreground">{grnCount} Annexure 6 issued</p>
                </div>
              </div>
              {linkedDeliveries.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No GRNs yet</p>
              ) : (
                <div className="space-y-1.5">
                  {linkedDeliveries.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground truncate">{d.qrCode}</span>
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 shrink-0",
                        d.acceptanceCertificateIssued
                          ? "border-teal-300 text-teal-700 bg-teal-50"
                          : "border-muted text-muted-foreground"
                      )}>
                        {d.acceptanceCertificateIssued ? "Issued" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                  <Link href="/grn">
                    <span className="text-[11px] text-primary hover:underline cursor-pointer">View all in GRN →</span>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices & Payments card */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                  <Receipt className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Invoices & Payments</p>
                  <p className="text-[11px] text-muted-foreground">{linkedInvoices.length} invoice{linkedInvoices.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {linkedInvoices.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No invoices submitted</p>
              ) : (
                <>
                  <p className="text-sm font-semibold tabular-nums mb-1">{formatINR(totalInvoiced)}</p>
                  <Badge variant="outline" className={cn(
                    "text-[10px] mb-2",
                    allInvoicesPaid
                      ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                      : "border-amber-300 text-amber-700 bg-amber-50"
                  )}>
                    {allInvoicesPaid ? "All Paid" : "Payment Pending"}
                  </Badge>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {linkedInvoices.map((inv) => (
                      <Link key={inv.id} href="/invoices">
                        <span className={cn(
                          "inline-block text-[10px] font-mono rounded px-1.5 py-0.5 border hover:opacity-80 transition-opacity cursor-pointer",
                          inv.status === "paid"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-indigo-50 border-indigo-200 text-indigo-700"
                        )} title={inv.invoiceNumber}>
                          {inv.invoiceNumber.length > 16 ? inv.invoiceNumber.slice(0, 16) + "…" : inv.invoiceNumber}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link href="/invoices">
                    <span className="text-[11px] text-primary hover:underline cursor-pointer">View all invoices →</span>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Audit Log */}
      <Accordion type="single" collapsible className="border rounded-lg bg-card">
        <AccordionItem value="audit-log" className="border-b-0">
          <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Audit Log
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                {auditLog.length} event{auditLog.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            {auditLog.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 italic">No events recorded yet.</p>
            ) : (
              <div className="relative">
                {auditLog.map((entry, idx) => (
                  <div key={entry.id} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                      {idx < auditLog.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", AUDIT_EVENT_COLORS[entry.eventType])}>
                          {entry.eventType.replace("_", " ")}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(entry.timestamp), "dd MMM yyyy, HH:mm")}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-snug">{entry.event}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {entry.actor} · <span className="italic">{entry.role}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Spec sheet slide-over — opened when product name in table is clicked */}
      <Sheet open={!!specProduct} onOpenChange={(open) => { if (!open) setSpecProduct(null); }}>
        <SheetContent className="sm:max-w-[600px] p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <SheetTitle className="text-base pr-8">{specProduct?.name}</SheetTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Technical Specification Sheet</p>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="px-6 py-4">
              {specProduct && (
                <ProductSpecSheet
                  equipmentId={specProduct.equipmentId}
                  equipmentName={specProduct.name}
                />
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Indent — {indent.indentNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {hasLineItems ? (
                <>
                  <p className="font-medium">{lineItems.length} product line item{lineItems.length !== 1 ? "s" : ""}</p>
                  <p className="text-xs mt-0.5">{indent.facilityName}</p>
                </>
              ) : (
                <>
                  <p className="font-medium">{indent.equipmentName} × {indent.quantity}</p>
                  <p className="text-xs mt-0.5">{indent.facilityName}</p>
                </>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Rejection Reason *</Label>
              <Textarea
                placeholder="Provide a clear and specific reason for rejection…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || processing}
              onClick={() => {
                if (!pendingStep) return;
                stepMutation.mutate({
                  stepNumber: pendingStep.stepNumber,
                  status: "rejected",
                  comments: rejectReason.trim(),
                });
                setRejectDialog(false);
                setRejectReason("");
              }}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

