import {
  useGetDashboardSummary, getGetDashboardSummaryQueryKey,
  useGetProcurementPipeline, getGetProcurementPipelineQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey,
  useGetVendorPerformance, getGetVendorPerformanceQueryKey,
  useGetSlaMetrics, getGetSlaMetricsQueryKey,
  useGetExpiringRateContracts, getGetExpiringRateContractsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShoppingCart, Truck, AlertTriangle, CheckCircle2, Clock, TrendingDown, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type CardColor = "blue" | "amber" | "emerald" | "violet" | "teal" | "rose" | "sky" | "orange";

const COLOR: Record<CardColor, { card: string; iconWrap: string; icon: string; value: string; dot: string }> = {
  blue:    { card: "bg-blue-50    border-blue-200",   iconWrap: "bg-blue-100",    icon: "text-blue-600",    value: "text-blue-700",    dot: "bg-blue-400" },
  amber:   { card: "bg-amber-50   border-amber-200",  iconWrap: "bg-amber-100",   icon: "text-amber-600",   value: "text-amber-700",   dot: "bg-amber-400" },
  emerald: { card: "bg-emerald-50 border-emerald-200",iconWrap: "bg-emerald-100", icon: "text-emerald-600", value: "text-emerald-700", dot: "bg-emerald-400" },
  violet:  { card: "bg-violet-50  border-violet-200", iconWrap: "bg-violet-100",  icon: "text-violet-600",  value: "text-violet-700",  dot: "bg-violet-400" },
  teal:    { card: "bg-teal-50    border-teal-200",   iconWrap: "bg-teal-100",    icon: "text-teal-600",    value: "text-teal-700",    dot: "bg-teal-400" },
  rose:    { card: "bg-rose-50    border-rose-200",   iconWrap: "bg-rose-100",    icon: "text-rose-600",    value: "text-rose-700",    dot: "bg-rose-400" },
  sky:     { card: "bg-sky-50     border-sky-200",    iconWrap: "bg-sky-100",     icon: "text-sky-600",     value: "text-sky-700",     dot: "bg-sky-400" },
  orange:  { card: "bg-orange-50  border-orange-200", iconWrap: "bg-orange-100",  icon: "text-orange-600",  value: "text-orange-700",  dot: "bg-orange-400" },
};

function KpiCard({ title, value, icon: Icon, sub, color }: {
  title: string; value: string | number; icon: React.ElementType; sub?: string; color: CardColor;
}) {
  const c = COLOR[color];
  return (
    <Card className={cn("border", c.card)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{title}</p>
            <p className={cn("text-3xl font-bold mt-1.5 leading-none", c.value)}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
          </div>
          <div className={cn("p-2.5 rounded-xl shrink-0", c.iconWrap)}>
            <Icon className={cn("h-5 w-5", c.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const PIPELINE_COLORS = ["#f59e0b", "#3b82f6", "#6366f1", "#8b5cf6", "#10b981", "#ef4444"];

const ACTIVITY_DOT: Record<string, string> = {
  indent_approved: "bg-emerald-400",
  indent_submitted: "bg-blue-400",
  po_created: "bg-violet-400",
  po_approved: "bg-indigo-400",
  grn_created: "bg-teal-400",
  invoice_submitted: "bg-amber-400",
  payment_released: "bg-emerald-500",
  tender_invited: "bg-sky-400",
};

export default function Dashboard() {
  const { data: summary, isLoading: s1 } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: pipeline } = useGetProcurementPipeline({ query: { queryKey: getGetProcurementPipelineQueryKey() } });
  const { data: activity } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });
  const { data: vendorPerf } = useGetVendorPerformance({ query: { queryKey: getGetVendorPerformanceQueryKey() } });
  const { data: sla } = useGetSlaMetrics({ query: { queryKey: getGetSlaMetricsQueryKey() } });
  const { data: expiring } = useGetExpiringRateContracts({ query: { queryKey: getGetExpiringRateContractsQueryKey() } });

  if (s1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Procurement Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Medical Services and Infrastructure Development Corporation</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Financial Year</p>
          <p className="text-sm font-bold text-foreground">2025–26</p>
        </div>
      </div>

      {/* Alert */}
      {expiring && expiring.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {expiring.length} rate contract{expiring.length > 1 ? "s" : ""} expiring within 60 days.{" "}
            <Link href="/rate-contracts" className="underline font-semibold">Review now</Link>
          </p>
        </div>
      )}

      {/* KPI Grid — 2 cols on mobile, 4 on md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard title="Total Indents"         value={summary?.totalIndents ?? 0}         icon={FileText}      sub="All procurement requests" color="blue" />
        <KpiCard title="Pending Approval"      value={summary?.pendingApproval ?? 0}      icon={AlertTriangle} sub="Awaiting GM review"        color="amber" />
        <KpiCard title="Active Rate Contracts" value={summary?.activeRateContracts ?? 0}  icon={CheckCircle2}  sub="Valid contracts"           color="emerald" />
        <KpiCard title="Active Purchase Orders"value={summary?.activePurchaseOrders ?? 0} icon={ShoppingCart}  sub="Approved POs"              color="violet" />
        <KpiCard title="Deliveries Pending QA" value={summary?.deliveriesPendingQA ?? 0}  icon={Truck}         sub="Awaiting verification"     color="teal" />
        <KpiCard title="Expiring Contracts"    value={summary?.expiringContracts ?? 0}    icon={Clock}         sub="Within 60 days"            color="orange" />
        <KpiCard title="Avg Cycle Time"        value={`${summary?.avgProcycleDays ?? 0}d`}icon={TrendingDown}  sub="Indent to PO"              color="sky" />
        <KpiCard title="QA Rejection Rate"     value={`${summary?.qaRejectionRate ?? 0}%`}icon={AlertTriangle} sub="Failed QA checks"          color="rose" />
      </div>

      {/* Pipeline + SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4" />Procurement Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipeline && pipeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pipeline} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}
                    formatter={(v) => [v, "Count"]}
                  />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                    {pipeline.map((_, i) => <Cell key={i} fill={PIPELINE_COLORS[i % PIPELINE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4" />SLA Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sla ? (
              <>
                <SlaRow label="Indent to Approval" days={sla.avgIndentToApprovalDays} target={5} />
                <SlaRow label="Approval to PO" days={sla.avgApprovalToPoDays} target={10} />
                <SlaRow label="PO to Delivery" days={sla.avgPoToDeliveryDays} target={30} />
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-bold text-red-600">{sla.slaBreaches}</p>
                    <p className="text-[10px] text-red-500 mt-0.5 font-medium">SLA Breaches</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-bold text-emerald-600">{sla.onTrackCount}</p>
                    <p className="text-[10px] text-emerald-500 mt-0.5 font-medium">On Track</p>
                  </div>
                </div>
              </>
            ) : <div className="text-muted-foreground text-sm">Loading...</div>}
          </CardContent>
        </Card>
      </div>

      {/* Activity + Vendor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity && activity.length > 0 ? activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={cn("h-2 w-2 mt-1.5 rounded-full shrink-0", ACTIVITY_DOT[item.type] ?? "bg-slate-400")} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.actor} · {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">No recent activity</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vendor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendorPerf && vendorPerf.length > 0 ? vendorPerf.slice(0, 5).map((v) => (
                <div key={v.vendorId} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-600">{v.vendorName.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate leading-tight">{v.vendorName}</p>
                    <p className="text-xs text-muted-foreground">{v.totalOrders} orders · {v.avgLeadTimeDays}d avg</p>
                  </div>
                  <div className="ml-2 shrink-0">
                    <ScoreBar score={v.performanceScore} />
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">No vendor data</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SlaRow({ label, days, target }: { label: string; days: number; target: number }) {
  const over = days > target;
  const pct = Math.min((days / (target * 1.5)) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className={cn("font-bold text-xs", over ? "text-red-600" : "text-emerald-600")}>{days}d</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", over ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "from-emerald-400 to-emerald-500" : score >= 60 ? "from-amber-400 to-amber-500" : "from-red-400 to-red-500";
  const text  = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full bg-gradient-to-r", color)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn("text-xs font-bold w-8 text-right tabular-nums", text)}>{score.toFixed(0)}%</span>
    </div>
  );
}
