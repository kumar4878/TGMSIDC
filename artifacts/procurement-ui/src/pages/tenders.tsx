import { useState } from "react";
import { Link } from "wouter";
import { useListTenders, getListTendersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Eye } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function Tenders() {
  const [search, setSearch] = useState("");
  const { data: tenders, isLoading } = useListTenders({ query: { queryKey: getListTendersQueryKey() } });

  const filtered = (tenders ?? []).filter((t) =>
    !search ||
    t.tenderNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.equipmentName.toLowerCase().includes(search.toLowerCase())
  );

  const MILESTONE_KEYS = [
    "planning","doc_prep","approval","invited","pre_bid","bids_received",
    "bid_query","technical_eval","commercial_eval","l1_identified","contract_final","rc_created",
  ];

  const STATUS_IDX: Record<string, number> = {
    planning:0, doc_prep:1, doc_preparation:1, approval:2,
    invited:3, pre_bid:4, bids_received:5, bid_query:6,
    technical_eval:7, technical_evaluation:7,
    commercial_eval:8, l1_identified:9, awarded:9,
    contract_final:10, rc_created:11,
  };

  function milestoneProgress(status: string) {
    return (STATUS_IDX[status] ?? -1) + 1;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manual milestone tracking for government e-procurement tenders</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tenders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tender No.</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipment</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Initiated</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ageing</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">L1 Bidder</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">L1 Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stage (12)</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No tenders found</td></tr>
                  ) : filtered.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{t.tenderNumber}</td>
                      <td className="px-4 py-3">{t.equipmentName}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy") : "—"}</td>
                      <td className="px-4 py-3">
                        {t.createdAt ? (
                          <span className={`font-semibold tabular-nums text-xs ${differenceInDays(new Date(), new Date(t.createdAt)) > 180 ? "text-red-600" : differenceInDays(new Date(), new Date(t.createdAt)) > 90 ? "text-amber-600" : "text-foreground"}`}>
                            {differenceInDays(new Date(), new Date(t.createdAt))}d
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">{t.l1BidderName ?? "—"}</td>
                      <td className="px-4 py-3">{t.l1BidderAmount != null ? `₹${t.l1BidderAmount.toLocaleString("en-IN")}` : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          {MILESTONE_KEYS.map((m, i) => (
                            <div key={m} title={m.replace(/_/g, " ")} className={`h-2 w-3 rounded-sm ${i < milestoneProgress(t.status) ? "bg-primary" : "bg-muted"}`} />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1.5">{milestoneProgress(t.status)}/{MILESTONE_KEYS.length}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3">
                        <Link href={`/tenders/${t.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
