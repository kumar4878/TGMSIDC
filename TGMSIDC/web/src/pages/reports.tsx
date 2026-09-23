import { useState } from "react";
import {
  useGetVendorPerformance, getGetVendorPerformanceQueryKey,
  useGetSlaMetrics, getGetSlaMetricsQueryKey,
  useGetProcurementPipeline, getGetProcurementPipelineQueryKey,
} from "@/lib/api-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, Cell, PieChart, Pie, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Minus, Download, Printer, RefreshCw,
  BarChart3, IndianRupee, Truck, ShieldCheck, AlertTriangle, CheckCircle2,
  FileText, Clock, Users, Activity, Gavel, XCircle, ShieldAlert,
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { mockEquipment, mockRateContracts, mockTenders, mockDistributionData } from "@/mocks/data";

/* ── Period options ───────────────────────────── */
const PERIODS = ["Apr–Jun 2025", "Jul–Sep 2025", "Oct–Dec 2025", "Jan–Mar 2026", "FY 2025-26"];

/* ── Tabs ─────────────────────────────────────── */
const TABS = [
  { id: "overview",      label: "Executive Overview",  icon: BarChart3 },
  { id: "financial",     label: "Financial",           icon: IndianRupee },
  { id: "procurement",   label: "Procurement",         icon: FileText },
  { id: "vendor",        label: "Vendor Scorecard",    icon: Users },
  { id: "sla",           label: "SLA & Compliance",    icon: ShieldCheck },
  { id: "rc_coverage",   label: "RC Coverage",         icon: ShieldCheck },
  { id: "tender_tracker",label: "Tender Tracker",      icon: Gavel },
  { id: "distribution",  label: "Distribution Analytics", icon: Truck },
];

/* ── Chart colour palette ─────────────────────── */
const C = {
  blue:    "#3b82f6", indigo: "#6366f1", emerald: "#10b981", amber: "#f59e0b",
  rose:    "#f43f5e", violet:"#8b5cf6", sky:     "#0ea5e9", teal:  "#14b8a6",
  orange:  "#f97316", slate: "#94a3b8",
};

/* ── Trend indicator ─────────────────────────── */
function Trend({ val, good }: { val: number; good: "up" | "down" }) {
  const up = val > 0;
  const isGood = good === "up" ? up : !up;
  const Icon = val === 0 ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", isGood ? "text-emerald-600" : "text-red-500")}>
      <Icon className="h-3 w-3" />
      {val === 0 ? "—" : `${Math.abs(val)}%`}
    </span>
  );
}

/* ── KPI Stat card ─────────────────────────────── */
function StatCard({ title, value, sub, trend, trendGood, icon: Icon, color }:{
  title:string; value:string|number; sub?:string; trend?:number; trendGood?:"up"|"down";
  icon:React.ElementType; color:string;
}) {
  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${color}18` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-0.5 text-foreground">{value}</p>
            {(sub || trend !== undefined) && (
              <div className="flex items-center gap-2 mt-1">
                {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
                {trend !== undefined && trendGood && <Trend val={trend} good={trendGood} />}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────── Mock datasets ─────────────────────── */
const monthlySpend = [
  { month:"Apr", spend:18.2, budget:22 },  { month:"May", spend:24.6, budget:22 },
  { month:"Jun", spend:21.1, budget:22 },  { month:"Jul", spend:28.4, budget:28 },
  { month:"Aug", spend:19.8, budget:28 },  { month:"Sep", spend:30.5, budget:28 },
  { month:"Oct", spend:26.7, budget:30 },  { month:"Nov", spend:33.2, budget:30 },
  { month:"Dec", spend:22.4, budget:30 },  { month:"Jan", spend:31.9, budget:32 },
  { month:"Feb", spend:27.6, budget:32 },  { month:"Mar", spend:35.8, budget:32 },
];

const spendByCategory = [
  { category:"Diagnostic Equipment",  value:8.42, pct:29 },
  { category:"Imaging Systems",       value:6.18, pct:21 },
  { category:"ICU & Life Support",    value:5.34, pct:18 },
  { category:"Surgical Instruments",  value:3.91, pct:13 },
  { category:"Laboratory Equipment",  value:3.02, pct:10 },
  { category:"General Medical",       value:2.63, pct:9  },
];

const budgetUtilization = [
  { dept:"AIIMS Hyderabad",     allocated:45, utilized:38.2, pct:85 },
  { dept:"Gandhi Hospital",     allocated:32, utilized:29.1, pct:91 },
  { dept:"Osmania General",     allocated:28, utilized:19.6, pct:70 },
  { dept:"Nizamabad DH",        allocated:15, utilized:11.8, pct:79 },
  { dept:"Karimnagar DH",       allocated:12, utilized:6.4,  pct:53 },
];

const cycleTrend = [
  { month:"Oct", indentApproval:5.1, approvalPO:9.3, poDelivery:25.2, total:39.6 },
  { month:"Nov", indentApproval:4.8, approvalPO:8.7, poDelivery:24.1, total:37.6 },
  { month:"Dec", indentApproval:4.5, approvalPO:8.9, poDelivery:22.8, total:36.2 },
  { month:"Jan", indentApproval:3.9, approvalPO:8.1, poDelivery:21.5, total:33.5 },
  { month:"Feb", indentApproval:3.5, approvalPO:7.9, poDelivery:21.1, total:32.5 },
  { month:"Mar", indentApproval:3.2, approvalPO:7.8, poDelivery:21.4, total:32.4 },
];

const indentAgeing = [
  { range:"0–7 days",  count:8, color:C.emerald },
  { range:"8–15 days", count:5, color:C.amber },
  { range:"16–30 days",count:3, color:C.orange },
  { range:">30 days",  count:4, color:C.rose },
];

const qaRejection = [
  { category:"Diagnostic",  rate:3.2 }, { category:"Imaging",  rate:5.4 },
  { category:"ICU",         rate:2.1 }, { category:"Surgical", rate:1.8 },
  { category:"Laboratory",  rate:4.0 }, { category:"General",  rate:1.2 },
];

const slaBreachesByStage = [
  { stage:"Indent Approval",  breaches:4, total:18, pct:22 },
  { stage:"Budget Clearance", breaches:2, total:18, pct:11 },
  { stage:"GM Approval",      breaches:6, total:15, pct:40 },
  { stage:"PO Issuance",      breaches:1, total:12, pct: 8 },
  { stage:"Delivery",         breaches:3, total:10, pct:30 },
  { stage:"GRN",              breaches:1, total:9,  pct:11 },
];

const complianceScores = [
  { subject:"Financial Controls", score:88 }, { subject:"Procurement Rules",   score:91 },
  { subject:"Vendor Due Diligence",score:76 }, { subject:"SLA Adherence",       score:72 },
  { subject:"3-Way Match",         score:95 }, { subject:"Documentation",       score:83 },
];

const monthlyBreachTrend = [
  { month:"Oct", breaches:8 }, { month:"Nov", breaches:7 }, { month:"Dec", breaches:9 },
  { month:"Jan", breaches:6 }, { month:"Feb", breaches:5 }, { month:"Mar", breaches:4 },
];

const vendorDetails = [
  { name:"BPL Medical Technologies Ltd",       orders:8,  onTime:6,  qaPass:87.5, leadDays:42, score:87, defects:3  },
  { name:"Siemens Healthineers India Pvt Ltd", orders:12, onTime:11, qaPass:96.0, leadDays:35, score:94, defects:1  },
  { name:"Nidek Medical India Pvt Ltd",        orders:5,  onTime:5,  qaPass:100,  leadDays:30, score:91, defects:0  },
  { name:"Philips India Ltd",                  orders:7,  onTime:5,  qaPass:89.3, leadDays:45, score:82, defects:2  },
  { name:"Trivitron Healthcare Pvt Ltd",       orders:4,  onTime:3,  qaPass:82.0, leadDays:50, score:75, defects:4  },
];

const CUSTOM_TOOLTIP_STYLE = { fontSize:12, borderRadius:8, border:"1px solid #e5e7eb", boxShadow:"0 4px 12px rgba(0,0,0,.08)" };

/* ── Recharts custom tooltip ─────────────────── */
function ChartTooltip({ active, payload, label, unit="" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold ml-auto pl-3">{p.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────── TABS content ─────────────────────── */

function OverviewTab({ pipeline, sla }: any) {
  const totalSpend = monthlySpend.reduce((s, m) => s + m.spend, 0).toFixed(1);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total PO Value (FY)" value={`₹${totalSpend}Cr`} sub="vs ₹317Cr budget" trend={-8} trendGood="up" icon={IndianRupee} color={C.blue} />
        <StatCard title="Active Indents"      value={18}    sub="Across 5 facilities" trend={+12} trendGood="up" icon={FileText}   color={C.violet} />
        <StatCard title="Avg Cycle Time"      value="32.4d" sub="Indent → Delivery"   trend={-18} trendGood="down" icon={Clock}    color={C.emerald} />
        <StatCard title="On-Time Delivery"    value="82%"   sub="5 active vendors"   trend={+5}  trendGood="up" icon={Truck}      color={C.teal} />
        <StatCard title="Budget Utilisation"  value="78.4%" sub="₹248.8Cr of ₹317Cr" trend={+6}  trendGood="up" icon={Activity}   color={C.amber} />
        <StatCard title="SLA Breaches"        value={sla?.slaBreaches ?? 4} sub="Last 30 days" trend={-33} trendGood="down" icon={AlertTriangle} color={C.rose} />
        <StatCard title="QA Pass Rate"        value="93.2%" sub="FY aggregate"        trend={+2}  trendGood="up" icon={CheckCircle2} color={C.sky} />
        <StatCard title="Active Vendors"      value={vendorDetails.length} sub="Empanelled suppliers" trend={0} trendGood="up" icon={Users} color={C.orange} />
      </div>

      {/* Spend trend */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Monthly Spend vs Budget (₹ Crore)</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Actual expenditure against allocated budget per month</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">On Track</Badge>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlySpend} margin={{ top:4, right:8, left:-8, bottom:0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue}    stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.blue}    stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip unit="Cr" />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
              <Area type="monotone" dataKey="spend"  stroke={C.blue}  strokeWidth={2.5} fill="url(#spendGrad)" name="Actual Spend" dot={false} />
              <Line type="monotone" dataKey="budget" stroke={C.amber} strokeWidth={1.5} strokeDasharray="6 3"   name="Budget Cap"  dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pipeline?.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pipeline} dataKey="count" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3}>
                      {pipeline.map((_: any, i: number) => <Cell key={i} fill={Object.values(C)[i % Object.values(C).length] as string} />)}
                    </Pie>
                    <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pipeline.map((p: any, i: number) => (
                    <div key={p.stage} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: Object.values(C)[i % Object.values(C).length] as string }} />
                      <span className="text-xs text-muted-foreground flex-1">{p.stage}</span>
                      <span className="text-xs font-bold">{p.count}</span>
                      <span className="text-[10px] text-muted-foreground w-7 text-right">{p.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
          </CardContent>
        </Card>

        {/* Spend by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Spend by Equipment Category (₹ Cr)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {spendByCategory.map((c, i) => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{c.category}</span>
                    <span className="font-semibold">₹{c.value}Cr <span className="text-muted-foreground font-normal">({c.pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${c.pct}%`, background: Object.values(C)[i] as string }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinancialTab() {
  return (
    <div className="space-y-5">
      {/* Budget utilization table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Budget Utilization by Institution (₹ Lakh)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                {["Institution","Allocated (₹L)","Utilized (₹L)","Remaining (₹L)","Utilization %","Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgetUtilization.map((b, i) => {
                const rem = (b.allocated - b.utilized).toFixed(1);
                const over = b.pct > 90;
                return (
                  <tr key={i} className="border-b hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium">{b.dept}</td>
                    <td className="px-4 py-3 text-right">₹{b.allocated}L</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{b.utilized}L</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">₹{rem}L</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width:`${b.pct}%`, background: b.pct > 90 ? C.rose : b.pct > 75 ? C.amber : C.emerald }} />
                        </div>
                        <span className={cn("text-xs font-bold w-9 text-right", over ? "text-rose-600" : "text-foreground")}>{b.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border-0", b.pct > 90 ? "bg-rose-100 text-rose-700" : b.pct < 60 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                        {b.pct > 90 ? "Critical" : b.pct < 60 ? "Under-utilised" : "Healthy"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">₹{budgetUtilization.reduce((s,b)=>s+b.allocated,0)}L</td>
                <td className="px-4 py-3 text-right">₹{budgetUtilization.reduce((s,b)=>s+b.utilized,0).toFixed(1)}L</td>
                <td className="px-4 py-3 text-right text-muted-foreground">₹{(budgetUtilization.reduce((s,b)=>s+b.allocated,0) - budgetUtilization.reduce((s,b)=>s+b.utilized,0)).toFixed(1)}L</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600">78.4%</td>
                <td className="px-4 py-3"><Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">On Track</Badge></td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Monthly spend + category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Monthly Expenditure Trend (₹ Crore)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlySpend} margin={{ top:4, right:8, left:-8, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize:11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip unit="Cr" />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
                <Bar dataKey="spend"  fill={C.blue}  radius={[4,4,0,0]} name="Actual Spend" />
                <Bar dataKey="budget" fill={C.slate} radius={[4,4,0,0]} name="Budget"       opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Spend Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={spendByCategory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={70} paddingAngle={2} label={false}>
                  {spendByCategory.map((_, i) => <Cell key={i} fill={Object.values(C)[i] as string} />)}
                </Pie>
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v:any) => [`₹${v}Cr`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {spendByCategory.map((c, i) => (
                <div key={c.category} className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ background: Object.values(C)[i] as string }} />
                  <span className="text-muted-foreground flex-1 truncate">{c.category}</span>
                  <span className="font-semibold">{c.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProcurementTab() {
  return (
    <div className="space-y-5">
      {/* Cycle time trend */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Procurement Cycle Time Trend (Days)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">6-month trend across all three cycle stages</p>
            </div>
            <div className="flex gap-3 text-xs text-right shrink-0">
              <div><p className="text-lg font-bold text-emerald-600">-18%</p><p className="text-muted-foreground">improvement</p></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cycleTrend} margin={{ top:4, right:8, left:-8, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip unit="d" />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
              <Line type="monotone" dataKey="indentApproval" stroke={C.blue}    strokeWidth={2.5} dot={{ r:4 }} name="Indent → Approval" />
              <Line type="monotone" dataKey="approvalPO"     stroke={C.amber}   strokeWidth={2.5} dot={{ r:4 }} name="Approval → PO" />
              <Line type="monotone" dataKey="poDelivery"     stroke={C.emerald} strokeWidth={2.5} dot={{ r:4 }} name="PO → Delivery" />
              <Line type="monotone" dataKey="total"          stroke={C.violet}  strokeWidth={1.5} dot={false} strokeDasharray="5 3" name="Total Cycle" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Indent ageing */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Indent Ageing Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={indentAgeing} layout="vertical" margin={{ top:4, right:16, left:16, bottom:0 }}>
                <XAxis type="number" tick={{ fontSize:10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="range" type="category" tick={{ fontSize:11 }} tickLine={false} axisLine={false} width={72} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v:any) => [v, "Indents"]} />
                <Bar dataKey="count" radius={[0,4,4,0]} name="Indents">
                  {indentAgeing.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <p className="text-xs text-rose-700 font-medium">4 indents aged &gt;30 days — requires immediate GM attention</p>
            </div>
          </CardContent>
        </Card>

        {/* QA rejection rate by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">QA Rejection Rate by Category (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={qaRejection} margin={{ top:4, right:8, left:-16, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize:10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v:any) => [`${v}%`, "Rejection Rate"]} />
                <Bar dataKey="rate" radius={[4,4,0,0]} name="QA Rejection %">
                  {qaRejection.map((d, i) => <Cell key={i} fill={d.rate > 4 ? C.rose : d.rate > 2.5 ? C.amber : C.emerald} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex gap-3 text-xs">
              {[["bg-emerald-400","≤2.5% — Good"],["bg-amber-400","2.5–4% — Watch"],["bg-rose-400",">4% — Critical"]].map(([bg,l]) => (
                <div key={l} className="flex items-center gap-1.5"><div className={`h-2.5 w-2.5 rounded-full ${bg}`} /><span className="text-muted-foreground">{l}</span></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VendorTab() {
  return (
    <div className="space-y-5">
      {/* Scorecard table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vendor Performance Scorecard</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                {["Vendor","Orders","On-Time","QA Pass %","Avg Lead (d)","Defects","Overall Score","Rating"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendorDetails.sort((a,b) => b.score - a.score).map((v, i) => {
                const pct = Math.round((v.onTime / v.orders) * 100);
                const rating = v.score >= 90 ? { label:"Excellent", cls:"bg-emerald-100 text-emerald-700" }
                             : v.score >= 80 ? { label:"Good",      cls:"bg-blue-100 text-blue-700" }
                             : v.score >= 70 ? { label:"Average",   cls:"bg-amber-100 text-amber-700" }
                             :                 { label:"Poor",      cls:"bg-rose-100 text-rose-700" };
                return (
                  <tr key={i} className="border-b hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 pl-5 py-3 font-medium text-sm">{v.name}</td>
                    <td className="px-4 py-3 text-center">{v.orders}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{v.onTime}/{v.orders}</span>
                        <span className={cn("text-[10px] font-bold", pct >= 90 ? "text-emerald-600" : pct >= 75 ? "text-amber-600" : "text-rose-600")}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${v.qaPass}%`, background: v.qaPass >= 90 ? C.emerald : v.qaPass >= 80 ? C.amber : C.rose }} />
                        </div>
                        <span className="text-xs font-semibold">{v.qaPass.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{v.leadDays}d</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("font-semibold", v.defects === 0 ? "text-emerald-600" : v.defects <= 2 ? "text-amber-600" : "text-rose-600")}>{v.defects}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width:`${v.score}%`, background: v.score >= 90 ? C.emerald : v.score >= 80 ? C.blue : v.score >= 70 ? C.amber : C.rose }} />
                        </div>
                        <span className="text-xs font-bold w-8">{v.score}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border-0", rating.cls)}>{rating.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Vendor radar + lead time chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Vendor — Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={complianceScores.map(c => ({ ...c, vendorA:88, vendorB:75, vendorC:91 }))}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:10, fill:"#64748b" }} />
                <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fontSize:9 }} tickCount={4} />
                <Radar name="Siemens" dataKey="vendorB" stroke={C.blue}    fill={C.blue}    fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Nidek"   dataKey="vendorC" stroke={C.emerald} fill={C.emerald} fillOpacity={0.15} strokeWidth={2} />
                <Radar name="BPL"     dataKey="vendorA" stroke={C.amber}   fill={C.amber}   fillOpacity={0.10} strokeWidth={2} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vendor Lead Time Comparison (Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={vendorDetails.map(v => ({ name:v.name.split(" ")[0], days:v.leadDays, score:v.score }))} margin={{ top:4, right:8, left:-8, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Bar dataKey="days" name="Avg Lead Days" radius={[4,4,0,0]}>
                  {vendorDetails.map((v, i) => <Cell key={i} fill={v.leadDays <= 35 ? C.emerald : v.leadDays <= 45 ? C.amber : C.rose} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SlaTab({ sla }: any) {
  const overallCompliance = Math.round(complianceScores.reduce((s,c) => s + c.score, 0) / complianceScores.length);
  return (
    <div className="space-y-5">
      {/* Compliance score headline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Compliance Score"  value={`${overallCompliance}%`} sub="6 control areas" trend={+4}  trendGood="up"   icon={ShieldCheck}    color={C.emerald} />
        <StatCard title="SLA Breaches (FY)" value={sla?.slaBreaches ?? 4}  sub="vs 14 last FY"  trend={-71} trendGood="down" icon={AlertTriangle}   color={C.rose} />
        <StatCard title="On-Time Closure"   value={`${sla?.onTrackCount ?? 23}`} sub="of 27 items"  trend={+10} trendGood="up"  icon={CheckCircle2}   color={C.blue} />
        <StatCard title="Escalations"       value={3}                       sub="Pending action" trend={-25} trendGood="down" icon={Activity}        color={C.amber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SLA breach by stage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SLA Breach Rate by Stage</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  {["Stage","Breach Count","Total Items","Breach Rate","Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slaBreachesByStage.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{s.stage}</td>
                    <td className="px-4 py-2.5 text-center font-bold" style={{ color: s.pct > 30 ? C.rose : s.pct > 15 ? C.amber : C.emerald }}>{s.breaches}</td>
                    <td className="px-4 py-2.5 text-center text-muted-foreground">{s.total}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${s.pct}%`, background: s.pct > 30 ? C.rose : s.pct > 15 ? C.amber : C.emerald }} />
                        </div>
                        <span className="text-xs font-bold w-9 text-right" style={{ color: s.pct > 30 ? C.rose : s.pct > 15 ? C.amber : C.emerald }}>{s.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge className={cn("text-[10px] border-0", s.pct > 30 ? "bg-rose-100 text-rose-700" : s.pct > 15 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                        {s.pct > 30 ? "Critical" : s.pct > 15 ? "At Risk" : "Healthy"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Breach trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SLA Breach Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyBreachTrend} margin={{ top:4, right:8, left:-16, bottom:0 }}>
                <defs>
                  <linearGradient id="breachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.rose} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.rose} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize:11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="breaches" stroke={C.rose} strokeWidth={2.5} fill="url(#breachGrad)" name="SLA Breaches" dot={{ r:4, fill:C.rose }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">Breaches down 50% over 6 months — positive trend maintained</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance radar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Procurement Compliance Framework Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width={280} height={240}>
            <RadarChart data={complianceScores}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize:10, fill:"#64748b" }} />
              <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fontSize:9 }} tickCount={5} />
              <Radar name="Score" dataKey="score" stroke={C.blue} fill={C.blue} fillOpacity={0.18} strokeWidth={2} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v:any) => [`${v}%`, "Score"]} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {complianceScores.map(c => (
              <div key={c.subject} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{c.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${c.score}%`, background: c.score >= 90 ? C.emerald : c.score >= 75 ? C.blue : c.score >= 60 ? C.amber : C.rose }} />
                    </div>
                  </div>
                </div>
                <span className={cn("text-sm font-bold shrink-0", c.score >= 90 ? "text-emerald-600" : c.score >= 75 ? "text-blue-600" : c.score >= 60 ? "text-amber-600" : "text-rose-600")}>
                  {c.score}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────── RC Coverage Tab ──────────────────── */
function RCCoverageTab() {
  const today = new Date();

  const rows = mockEquipment.map((eq) => {
    const itemRCs = mockRateContracts.filter((rc) => rc.equipmentId === eq.id);
    const activeRC = itemRCs.find((rc) => rc.status === "active" && new Date(rc.endDate) > today);
    const expiredRC = itemRCs
      .filter((rc) => new Date(rc.endDate) <= today)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
    const activeTender = mockTenders.find((t) => {
      const first = eq.name.toLowerCase().split(" ")[0];
      return t.equipmentName.toLowerCase().includes(first) && t.status !== "rc_created" && t.status !== "awarded";
    });

    let status: "active_rc" | "expiring_soon" | "expired" | "tender_in_progress" | "no_coverage";
    let daysLeft: number | null = null;
    let rcNum: string | null = null;
    let expiry: string | null = null;

    if (activeRC) {
      daysLeft = differenceInDays(new Date(activeRC.endDate), today);
      status = daysLeft <= 180 ? "expiring_soon" : "active_rc";
      rcNum = activeRC.contractNumber;
      expiry = activeRC.endDate;
    } else if (activeTender) {
      status = "tender_in_progress";
    } else if (expiredRC) {
      status = "expired";
      rcNum = expiredRC.contractNumber;
      expiry = expiredRC.endDate;
      daysLeft = differenceInDays(new Date(expiredRC.endDate), today);
    } else {
      status = "no_coverage";
    }
    return { eq, status, rcNum, expiry, daysLeft };
  });

  const counts = {
    active:   rows.filter(r => r.status === "active_rc").length,
    expiring: rows.filter(r => r.status === "expiring_soon").length,
    expired:  rows.filter(r => r.status === "expired").length,
    tender:   rows.filter(r => r.status === "tender_in_progress").length,
    none:     rows.filter(r => r.status === "no_coverage").length,
  };

  const expiryBuckets = [
    { label: "≤ 30 days", count: rows.filter(r => r.daysLeft != null && r.daysLeft >= 0 && r.daysLeft <= 30).length, color: C.rose },
    { label: "31–90 days", count: rows.filter(r => r.daysLeft != null && r.daysLeft > 30 && r.daysLeft <= 90).length, color: C.orange },
    { label: "91–180 days", count: rows.filter(r => r.daysLeft != null && r.daysLeft > 90 && r.daysLeft <= 180).length, color: C.amber },
    { label: "> 180 days", count: rows.filter(r => r.daysLeft != null && r.daysLeft > 180).length, color: C.emerald },
  ];

  const STATUS_STYLE: Record<string, string> = {
    active_rc: "text-emerald-700 bg-emerald-50",
    expiring_soon: "text-amber-700 bg-amber-50",
    expired: "text-red-700 bg-red-50",
    tender_in_progress: "text-blue-700 bg-blue-50",
    no_coverage: "text-slate-500 bg-slate-50",
  };
  const STATUS_LABEL: Record<string, string> = {
    active_rc: "Active RC", expiring_soon: "Expiring Soon", expired: "Expired",
    tender_in_progress: "Tender in Progress", no_coverage: "No Coverage",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Active RC", val: counts.active, color: C.emerald },
          { label: "Expiring ≤180d", val: counts.expiring, color: C.amber },
          { label: "Expired", val: counts.expired, color: C.rose },
          { label: "Tender in Progress", val: counts.tender, color: C.blue },
          { label: "No Coverage", val: counts.none, color: C.slate },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: k.color }}>{k.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Coverage Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[
                  { name: "Active RC", value: counts.active, fill: C.emerald },
                  { name: "Expiring Soon", value: counts.expiring, fill: C.amber },
                  { name: "Expired", value: counts.expired, fill: C.rose },
                  { name: "Tender in Progress", value: counts.tender, fill: C.blue },
                  { name: "No Coverage", value: counts.none, fill: C.slate },
                ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Expiry Forecast (Active RCs)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={expiryBuckets} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="RCs">
                  {expiryBuckets.map((b) => <Cell key={b.label} fill={b.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Item-wise RC Coverage (RPT-01 / RPT-03)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Item Code</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Item Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">RC Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">RC Number</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expiry Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Days Remaining</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ eq, status, rcNum, expiry, daysLeft }) => (
                  <tr key={eq.id} className="border-b hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-mono text-xs text-primary">{eq.equipmentCode}</td>
                    <td className="px-4 py-2.5 font-medium text-sm">{eq.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_STYLE[status])}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{rcNum ?? "—"}</td>
                    <td className="px-4 py-2.5 text-sm">
                      {expiry ? format(new Date(expiry), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {daysLeft != null ? (
                        <span className={cn("font-semibold tabular-nums text-sm",
                          daysLeft < 0 ? "text-red-600" : daysLeft <= 90 ? "text-amber-600" : "text-emerald-600"
                        )}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────── Tender Tracker Tab ────────────────── */
function TenderTrackerTab() {
  const today = new Date();

  const STATUS_IDX: Record<string, number> = {
    planning: 0, doc_prep: 1, approval: 2, invited: 3, pre_bid: 4, bids_received: 5,
    bid_query: 6, technical_eval: 7, technical_evaluation: 7, commercial_eval: 8,
    l1_identified: 9, awarded: 9, contract_final: 10, rc_created: 11,
  };
  const STAGE_LABELS = [
    "Planning","Doc Prep","Approval","Publication","Pre-Bid","Bid Receipt",
    "Query Handling","Tech Eval","Comm. Eval","L1 Award","Contract Final","RC Created",
  ];

  const tenderRows = mockTenders.map((t) => {
    const stageIdx = STATUS_IDX[t.status] ?? 0;
    const totalDays = t.createdAt ? differenceInDays(today, new Date(t.createdAt)) : null;
    const lastUpdateDays = t.updatedAt ? differenceInDays(today, new Date(t.updatedAt)) : null;
    const isDelayed = totalDays != null && totalDays > 180;
    return { t, stageIdx, totalDays, lastUpdateDays, isDelayed };
  });

  const tendersByStage = STAGE_LABELS.map((label, i) => ({
    stage: label,
    count: tenderRows.filter(r => r.stageIdx === i).length,
  }));

  const delayed = tenderRows.filter(r => r.isDelayed).length;
  const inProgress = tenderRows.filter(r => r.stageIdx < 11).length;
  const completed = tenderRows.filter(r => r.stageIdx >= 11).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Total Tenders</p>
          <p className="text-3xl font-bold mt-1 text-blue-600">{tenderRows.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">In Progress</p>
          <p className="text-3xl font-bold mt-1 text-amber-600">{inProgress}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Delayed (&gt;180d)</p>
          <p className="text-3xl font-bold mt-1 text-red-600">{delayed}</p>
        </CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Tenders by Stage (12-Stage BRD)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tendersByStage} layout="vertical" margin={{ left: 80, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 9 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" name="Tenders" fill={C.blue} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Tender Ageing (RPT-05)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[
                { bucket: "0–30d",   count: tenderRows.filter(r => r.totalDays != null && r.totalDays <= 30).length },
                { bucket: "31–90d",  count: tenderRows.filter(r => r.totalDays != null && r.totalDays > 30 && r.totalDays <= 90).length },
                { bucket: "91–180d", count: tenderRows.filter(r => r.totalDays != null && r.totalDays > 90 && r.totalDays <= 180).length },
                { bucket: ">180d",   count: tenderRows.filter(r => r.totalDays != null && r.totalDays > 180).length },
              ]} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Tenders" fill={C.indigo} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Tender Progress Register (RPT-04 / RPT-05)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tender No.</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipment</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Current Stage</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stage Progress</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total Ageing</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Activity</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {tenderRows.map(({ t, stageIdx, totalDays, lastUpdateDays, isDelayed }) => (
                  <tr key={t.id} className={cn("border-b hover:bg-muted/20", isDelayed && "bg-red-50/40")}>
                    <td className="px-4 py-2.5 font-mono text-xs text-primary">{t.tenderNumber}</td>
                    <td className="px-4 py-2.5 font-medium">{t.equipmentName}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium">{STAGE_LABELS[stageIdx]}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">({stageIdx + 1}/12)</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-0.5">
                        {STAGE_LABELS.map((_, i) => (
                          <div key={i} className={cn("h-1.5 w-2.5 rounded-sm", i <= stageIdx ? "bg-primary" : "bg-muted")} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {totalDays != null ? (
                        <span className={cn("font-semibold tabular-nums text-xs", isDelayed ? "text-red-600" : totalDays > 90 ? "text-amber-600" : "text-foreground")}>
                          {totalDays}d {isDelayed ? "⚠ Delayed" : ""}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {lastUpdateDays != null ? `${lastUpdateDays}d ago` : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                        stageIdx >= 11 ? "bg-emerald-50 text-emerald-700" :
                        isDelayed ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                      )}>
                        {stageIdx >= 11 ? "Completed" : isDelayed ? "Delayed" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────── Main page ─────────────────────────── */
/* ─────────── Distribution Analytics Tab ────────── */
function DistributionTab() {
  const [itemFilter, setItemFilter] = useState("all");
  const items = [...new Set(mockDistributionData.map(d => d.itemName))];
  const filtered = itemFilter === "all" ? mockDistributionData : mockDistributionData.filter(d => d.itemName === itemFilter);

  const totalProcured = filtered.reduce((s, d) => s + d.procured, 0);
  const totalDistributed = filtered.reduce((s, d) => s + d.distributed, 0);
  const totalExpired = filtered.reduce((s, d) => s + d.expired, 0);
  const totalWasted = filtered.reduce((s, d) => s + d.wasted, 0);
  const wasteRate = totalProcured > 0 ? ((totalExpired + totalWasted) / totalProcured * 100).toFixed(1) : "0";
  const utilRate = totalProcured > 0 ? (totalDistributed / totalProcured * 100).toFixed(1) : "0";

  const chartData = [...new Map(filtered.map(d => [d.facilityName, d])).values()].map(d => ({
    name: d.facilityName.split(",")[0].replace("Govt. General Hospital", "GGH"),
    Distributed: d.distributed,
    "Near-Expiry": d.nearExpiry,
    Expired: d.expired,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Procured" value={totalProcured.toLocaleString()} sub={filtered[0]?.unit ?? ""} trend={0} icon={FileText} color={C.blue} />
        <StatCard title="Total Distributed" value={totalDistributed.toLocaleString()} sub="To facilities" trend={+3} trendGood="up" icon={Truck} color={C.emerald} />
        <StatCard title="Distribution Rate" value={`${utilRate}%`} sub="vs procured" trend={+2} trendGood="up" icon={CheckCircle2} color={C.sky} />
        <StatCard title="Expiry / Wastage Rate" value={`${wasteRate}%`} sub="of total procured" trend={-1} trendGood="down" icon={AlertTriangle} color={C.rose} />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter by item:</span>
        <div className="flex gap-1.5">
          <button onClick={() => setItemFilter("all")} className={cn("px-3 py-1 rounded-full text-xs font-medium border", itemFilter === "all" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-foreground/30")}>All Items</button>
          {items.map(item => (
            <button key={item} onClick={() => setItemFilter(item)} className={cn("px-3 py-1 rounded-full text-xs font-medium border", itemFilter === item ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-foreground/30")}>
              {item.split("(")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Facility-wise Distribution — {itemFilter === "all" ? "All Items" : itemFilter}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Distributed" fill={C.emerald} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Near-Expiry" fill={C.amber} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expired" fill={C.rose} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Facility Distribution Register</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground">
                {["Facility", "District", "Item", "Procured", "Received", "Distributed", "Stock On Hand", "Near-Expiry", "Expired", "Wasted", "Waste %"].map(h => (
                  <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const wasteP = d.procured > 0 ? ((d.expired + d.wasted) / d.procured * 100).toFixed(1) : "0";
                const wasteNum = parseFloat(wasteP);
                return (
                  <tr key={i} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-medium text-xs">{d.facilityName}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{d.district}</td>
                    <td className="px-4 py-2.5 text-xs">{d.itemName.split("(")[0].trim()}</td>
                    {[d.procured, d.received, d.distributed, d.stockOnHand, d.nearExpiry, d.expired, d.wasted].map((v, vi) => (
                      <td key={vi} className="px-4 py-2.5 text-right text-xs font-medium">{v}</td>
                    ))}
                    <td className={cn("px-4 py-2.5 text-right text-xs font-bold", wasteNum > 5 ? "text-red-600" : wasteNum > 2 ? "text-amber-600" : "text-emerald-700")}>
                      {wasteP}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("FY 2025-26");

  const { data: vendorPerf } = useGetVendorPerformance({ query: { queryKey: getGetVendorPerformanceQueryKey() } });
  const { data: sla }        = useGetSlaMetrics({ query: { queryKey: getGetSlaMetricsQueryKey() } });
  const { data: pipeline }   = useGetProcurementPipeline({ query: { queryKey: getGetProcurementPipelineQueryKey() } });

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Reports &amp; Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Enterprise procurement intelligence — FY 2025-26</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Period selector */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 text-xs">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-2.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap",
                  period === p ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
            <Download className="h-3.5 w-3.5" />Export
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
            <Printer className="h-3.5 w-3.5" />Print
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground shrink-0">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Period badge */}
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-3 py-1">
          Reporting Period: {period}
        </Badge>
        <Badge className="bg-slate-100 text-slate-600 border-0 text-xs px-3 py-1">
          Last updated: {new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
        </Badge>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                tab === t.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview"       && <OverviewTab     pipeline={pipeline} sla={sla} />}
      {tab === "financial"      && <FinancialTab />}
      {tab === "procurement"    && <ProcurementTab />}
      {tab === "vendor"         && <VendorTab />}
      {tab === "sla"            && <SlaTab sla={sla} />}
      {tab === "rc_coverage"    && <RCCoverageTab />}
      {tab === "tender_tracker" && <TenderTrackerTab />}
      {tab === "distribution"   && <DistributionTab />}
    </div>
  );
}
