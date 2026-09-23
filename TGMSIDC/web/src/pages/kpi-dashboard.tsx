import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis,
  ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, XCircle,
  Activity, ShieldCheck, Lightbulb, ThumbsUp,
} from "lucide-react";
import { mockKPIs } from "@/mocks/data";
import type { KPIMetric } from "@/mocks/data";

const PERIODS = ["FY 2025-26", "Q4 (Jan–Mar 2026)", "Last 30 Days"] as const;
type Period = typeof PERIODS[number];

const RAG_BADGE: Record<string, { cls: string; icon: React.ElementType; label: string }> = {
  green: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "On Target" },
  amber: { cls: "bg-amber-100 text-amber-700 border-amber-200",       icon: AlertTriangle, label: "Watch"     },
  red:   { cls: "bg-red-100 text-red-700 border-red-200",             icon: XCircle,       label: "Action"    },
};

const SCORE_MAP: Record<string, number> = { green: 100, amber: 50, red: 0 };

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;
  const stroke = color === "emerald" ? "#10b981" : color === "amber" ? "#f59e0b" : "#ef4444";
  const fill   = color === "emerald" ? "#065f46" : color === "amber" ? "#92400e" : "#991b1b";
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" className="shrink-0">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <circle
        cx="65" cy="65" r={r} fill="none"
        stroke={stroke} strokeWidth="12"
        strokeDasharray={circumference} strokeDashoffset={dashOffset}
        strokeLinecap="round" transform="rotate(-90 65 65)"
      />
      <text x="65" y="62" textAnchor="middle" fontSize="26" fontWeight="900" fill={fill}>{score}</text>
      <text x="65" y="78" textAnchor="middle" fontSize="11" fill="#94a3b8">/100</text>
    </svg>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")   return <TrendingUp   className="h-3.5 w-3.5 text-emerald-600" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500"     />;
  return                       <Minus        className="h-3.5 w-3.5 text-slate-400"   />;
}

function SparkChart({ kpi }: { kpi: KPIMetric }) {
  const barColor = kpi.status === "green" ? "#10b981" : kpi.status === "amber" ? "#f59e0b" : "#ef4444";
  const lineColor = kpi.trend === "up"
    ? (kpi.direction === "lower_is_better" ? "#ef4444" : "#10b981")
    : kpi.trend === "down"
    ? (kpi.direction === "lower_is_better" ? "#10b981" : "#ef4444")
    : "#94a3b8";
  return (
    <ResponsiveContainer width="100%" height={44}>
      <ComposedChart data={kpi.historicalValues} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Bar dataKey="value" fill={barColor} opacity={0.35} radius={[2, 2, 0, 0]} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={1.5}
          dot={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 10, borderRadius: 6, padding: "2px 6px" }}
          labelStyle={{ display: "none" }}
          formatter={(v: number) => [`${v}${kpi.unit}`, ""]}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const compositeScore = Math.round(
  mockKPIs.reduce((s, k) => s + SCORE_MAP[k.status], 0) / mockKPIs.length,
);
const scoreColor = compositeScore >= 80 ? "emerald" : compositeScore >= 55 ? "amber" : "red";
const scoreLabel = compositeScore >= 80 ? "Good" : compositeScore >= 55 ? "Needs Attention" : "Critical";

function deltaPct(current: number, prior: number): string {
  if (!prior) return "—";
  const d = ((current - prior) / prior) * 100;
  return `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`;
}

const insights: { type: "issue" | "win"; title: string; detail: string; kpiId: string }[] = [
  {
    type:   "issue",
    title:  "Stock-Out Rate rising",
    detail: "8.3% — above 5% target and trending up. Gandhi Hospital and Sangareddy need immediate replenishment.",
    kpiId:  "stock_out_rate",
  },
  {
    type:   "issue",
    title:  "FEFO compliance below threshold",
    detail: "78.5% vs ≥90% target. Older batches are being skipped in issue, risking near-expiry wastage.",
    kpiId:  "fefo_compliance",
  },
  {
    type:   "issue",
    title:  "Near-Expiry stock trending up",
    detail: "12.7% of total stock approaching expiry. 6-month trend shows consistent increase — redistribute immediately.",
    kpiId:  "near_expiry_pct",
  },
  {
    type:   "win",
    title:  "Forecast Accuracy above target",
    detail: "87.3% — exceeds 85% target and still improving. Enables more reliable indent planning.",
    kpiId:  "forecast_accuracy",
  },
  {
    type:   "win",
    title:  "Redistribution TAT well within SLA",
    detail: "4.2 days vs ≤5d target. Cross-facility transfers being processed efficiently.",
    kpiId:  "redistribution_tat",
  },
  {
    type:   "win",
    title:  "Overstock rate declining",
    detail: "Down from 25% to 21.4% over 4 months — redistribution programme is working.",
    kpiId:  "overstock_rate",
  },
];

const issues = insights.filter(i => i.type === "issue");
const wins   = insights.filter(i => i.type === "win");

export default function KPIDashboard() {
  const [period, setPeriod] = useState<Period>("FY 2025-26");

  const greenCount = mockKPIs.filter(k => k.status === "green").length;
  const amberCount = mockKPIs.filter(k => k.status === "amber").length;
  const redCount   = mockKPIs.filter(k => k.status === "red").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supply Chain KPI Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Executive performance view — inventory, QC, redistribution and forecast KPIs
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === p
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Composite health score hero */}
      <Card className={`border-2 border-${scoreColor}-200 bg-gradient-to-r from-${scoreColor}-50 to-background`}>
        <CardContent className="py-5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <ScoreRing score={compositeScore} color={scoreColor} />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Composite Health Score
                </p>
                <Badge className={`mt-1 border bg-${scoreColor}-100 text-${scoreColor}-700 border-${scoreColor}-200 text-sm px-3`}>
                  {scoreLabel}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Weighted average across {mockKPIs.length} KPIs · Period: {period}
                </p>
              </div>
            </div>
            <div className="flex-1 h-px bg-border mx-2" />
            <div className="flex gap-6">
              {[
                { label: "On Target", count: greenCount, color: "emerald", icon: CheckCircle2 },
                { label: "Watch",     count: amberCount, color: "amber",   icon: AlertTriangle },
                { label: "Action",    count: redCount,   color: "red",     icon: XCircle },
              ].map(({ label, count, color, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center mx-auto mb-1`}>
                    <Icon className={`h-5 w-5 text-${color}-600`} />
                  </div>
                  <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Insights */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Issues Requiring Attention
              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs border">{issues.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {issues.map((ins, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-md bg-red-50 border border-red-100 p-2.5">
                <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-800">{ins.title}</p>
                  <p className="text-xs text-red-700/80 mt-0.5 leading-snug">{ins.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
              <ThumbsUp className="h-4 w-4 text-emerald-500" />
              Positive Trends
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs border">{wins.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {wins.map((ins, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-md bg-emerald-50 border border-emerald-100 p-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800">{ins.title}</p>
                  <p className="text-xs text-emerald-700/80 mt-0.5 leading-snug">{ins.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {mockKPIs.map(kpi => {
          const rag    = RAG_BADGE[kpi.status];
          const RagIcon = rag.icon;
          const borderCls = kpi.status === "green"
            ? "border-l-emerald-500"
            : kpi.status === "amber"
            ? "border-l-amber-500"
            : "border-l-red-500";
          const valueCls = kpi.status === "green"
            ? "text-emerald-700"
            : kpi.status === "amber"
            ? "text-amber-700"
            : "text-red-700";
          const prior = kpi.historicalValues[kpi.historicalValues.length - 2]?.value;
          const delta = prior !== undefined ? deltaPct(kpi.currentValue, prior) : "—";
          const deltaGood = kpi.direction === "lower_is_better"
            ? kpi.currentValue <= (prior ?? kpi.currentValue)
            : kpi.currentValue >= (prior ?? kpi.currentValue);
          return (
            <Card key={kpi.id} className={`border-l-4 ${borderCls}`}>
              <CardHeader className="pb-1 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm leading-tight">{kpi.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{kpi.description}</p>
                  </div>
                  <Badge className={`text-xs border shrink-0 ${rag.cls}`}>
                    <RagIcon className="h-3 w-3 mr-1" />{rag.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-end justify-between mb-1">
                  <div>
                    <span className={`text-2xl font-bold ${valueCls}`}>{kpi.currentValue}</span>
                    <span className="text-sm text-muted-foreground ml-1">{kpi.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendIcon trend={kpi.trend} />
                    <span className={`font-medium ${deltaGood ? "text-emerald-600" : "text-red-500"}`}>
                      {delta}
                    </span>
                    <span className="text-muted-foreground">vs prior</span>
                  </div>
                </div>
                <SparkChart kpi={kpi} />
                <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                  <div className="text-xs">
                    <div className="w-full h-0.5 bg-emerald-500 rounded mb-0.5" />
                    <span className="text-muted-foreground">
                      {kpi.direction === "lower_is_better" ? `<${kpi.thresholdGreen}` : `>${kpi.thresholdGreen}`}{kpi.unit}
                    </span>
                  </div>
                  <div className="text-xs">
                    <div className="w-full h-0.5 bg-amber-500 rounded mb-0.5" />
                    <span className="text-muted-foreground">
                      {kpi.direction === "lower_is_better" ? `<${kpi.thresholdAmber}` : `>${kpi.thresholdAmber}`}{kpi.unit}
                    </span>
                  </div>
                  <div className="text-xs">
                    <div className="w-full h-0.5 bg-red-500 rounded mb-0.5" />
                    <span className="text-muted-foreground">
                      {kpi.direction === "lower_is_better" ? `>${kpi.thresholdRed}` : `<${kpi.thresholdRed}`}{kpi.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scorecard table — simplified, no Direction column */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            KPI Scorecard
            <span className="text-xs text-muted-foreground font-normal ml-1">· {period}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>KPI</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">vs Prior Period</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Watch</TableHead>
                <TableHead className="text-right">Alert</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockKPIs.map(kpi => {
                const rag      = RAG_BADGE[kpi.status];
                const RagIcon  = rag.icon;
                const prior    = kpi.historicalValues[kpi.historicalValues.length - 2]?.value;
                const delta    = prior !== undefined ? deltaPct(kpi.currentValue, prior) : "—";
                const deltaGood = prior !== undefined
                  ? (kpi.direction === "lower_is_better"
                      ? kpi.currentValue <= prior
                      : kpi.currentValue >= prior)
                  : true;
                const valueCls = kpi.status === "green"
                  ? "text-emerald-700"
                  : kpi.status === "amber"
                  ? "text-amber-700"
                  : "text-red-700";
                return (
                  <TableRow key={kpi.id} className="hover:bg-muted/20">
                    <TableCell>
                      <p className="text-sm font-medium">{kpi.name}</p>
                      <p className="text-xs text-muted-foreground">{kpi.description}</p>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${valueCls}`}>
                      {kpi.currentValue}{kpi.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-xs font-semibold ${deltaGood ? "text-emerald-600" : "text-red-500"}`}>
                        {delta}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-emerald-700">
                      {kpi.direction === "lower_is_better" ? `<${kpi.thresholdGreen}` : `>${kpi.thresholdGreen}`}{kpi.unit}
                    </TableCell>
                    <TableCell className="text-right text-xs text-amber-700">
                      {kpi.direction === "lower_is_better" ? `<${kpi.thresholdAmber}` : `>${kpi.thresholdAmber}`}{kpi.unit}
                    </TableCell>
                    <TableCell className="text-right text-xs text-red-700">
                      {kpi.direction === "lower_is_better" ? `>${kpi.thresholdRed}` : `<${kpi.thresholdRed}`}{kpi.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendIcon trend={kpi.trend} />
                        <span className="text-xs text-muted-foreground capitalize">{kpi.trend}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${rag.cls}`}>
                        <RagIcon className="h-3 w-3 mr-1" />{rag.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
