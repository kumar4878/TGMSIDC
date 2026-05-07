import { useState } from "react";
import { Link } from "wouter";
import { useListTenders, getListTendersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Eye } from "lucide-react";
import { format } from "date-fns";

export default function Tenders() {
  const [search, setSearch] = useState("");
  const { data: tenders, isLoading } = useListTenders({ query: { queryKey: getListTendersQueryKey() } });

  const filtered = (tenders ?? []).filter((t) =>
    !search ||
    t.tenderNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.equipmentName.toLowerCase().includes(search.toLowerCase())
  );

  const MILESTONES = ["invited", "bids_received", "l1_identified", "rc_created"];

  function milestoneProgress(status: string) {
    const idx = MILESTONES.indexOf(status);
    return idx >= 0 ? idx + 1 : 0;
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
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Invited</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">L1 Bidder</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">L1 Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Progress</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No tenders found</td></tr>
                  ) : filtered.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{t.tenderNumber}</td>
                      <td className="px-4 py-3">{t.equipmentName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.tenderInvitedDate ? format(new Date(t.tenderInvitedDate), "dd MMM yyyy") : "—"}</td>
                      <td className="px-4 py-3">{t.l1BidderName ?? "—"}</td>
                      <td className="px-4 py-3">{t.l1BidderAmount != null ? `₹${t.l1BidderAmount.toLocaleString("en-IN")}` : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {MILESTONES.map((m, i) => (
                            <div key={m} className={`h-2 w-6 rounded-full ${i < milestoneProgress(t.status) ? "bg-primary" : "bg-muted"}`} />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">{milestoneProgress(t.status)}/{MILESTONES.length}</span>
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
