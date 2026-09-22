import { useState } from "react";
import { Link } from "wouter";
import {
  useListRateContracts, getListRateContractsQueryKey,
  useGetExpiringRateContracts, getGetExpiringRateContractsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Eye, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RateContracts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const activeFilter = statusFilter !== "all" ? statusFilter : undefined;
  const { data: contracts, isLoading } = useListRateContracts(
    activeFilter ? { status: activeFilter } : {},
    { query: { queryKey: getListRateContractsQueryKey(activeFilter ? { status: activeFilter } : {}) } }
  );
  const { data: expiring } = useGetExpiringRateContracts({ query: { queryKey: getGetExpiringRateContractsQueryKey() } });

  const filtered = (contracts ?? []).filter((c) =>
    !search ||
    c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
    c.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  function getExpiryWarning(endDate: string) {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0)   return { text: "Expired",              color: "text-red-600" };
    if (days <= 30) return { text: `Expires in ${days}d`,  color: "text-red-600" };
    if (days <= 90) return { text: `Expires in ${days}d`,  color: "text-orange-600" };
    if (days <= 180) return { text: `Expires in ${days}d`, color: "text-amber-600" };
    return null;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rate Contracts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Active and historical procurement rate contracts</p>
        </div>
        <Link href="/rate-contracts/new">
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Contract</Button>
        </Link>
      </div>

      {expiring && expiring.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">{expiring.length} contract{expiring.length > 1 ? "s" : ""} expiring within 180 days — action required (BR-09)</p>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search contracts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
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
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contract No.</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipment</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vendor</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit Price</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">GST</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">End Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No rate contracts found</td></tr>
                  ) : filtered.map((rc) => {
                    const warning = getExpiryWarning(rc.endDate);
                    return (
                      <tr key={rc.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{rc.contractNumber}</td>
                        <td className="px-4 py-3">{rc.equipmentName}</td>
                        <td className="px-4 py-3">{rc.vendorName}</td>
                        <td className="px-4 py-3 font-semibold">₹{rc.unitPrice.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">{rc.gstRate}%</td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-foreground">{format(new Date(rc.endDate), "dd MMM yyyy")}</span>
                            {warning && <span className={`block text-xs ${warning.color} font-medium mt-0.5`}>{warning.text}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={rc.status} /></td>
                        <td className="px-4 py-3">
                          <Link href={`/rate-contracts/${rc.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
