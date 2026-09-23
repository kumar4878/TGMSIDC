import { useState } from "react";
import { Link } from "wouter";
import { useListPurchaseOrders, getListPurchaseOrdersQueryKey, useApprovePurchaseOrder, useCancelPurchaseOrder } from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Eye, Check } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PurchaseOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const activeFilter = statusFilter !== "all" ? statusFilter : undefined;
  const { data: pos, isLoading } = useListPurchaseOrders(
    activeFilter ? { status: activeFilter } : {},
    { query: { queryKey: getListPurchaseOrdersQueryKey(activeFilter ? { status: activeFilter } : {}) } }
  );
  const approvePO = useApprovePurchaseOrder();

  const filtered = (pos ?? []).filter((p) =>
    !search ||
    p.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    p.equipmentName.toLowerCase().includes(search.toLowerCase())
  );

  function handleApprove(id: string) {
    approvePO.mutate(id, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPurchaseOrdersQueryKey() })
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All issued purchase orders and their status</p>
        </div>
        <Link href="/purchase-orders/new">
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />New PO</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search purchase orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">PO Number</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipment</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vendor</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qty</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total (incl. GST)</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expected Delivery</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No purchase orders found</td></tr>
                  ) : filtered.map((po) => (
                    <tr key={po.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{po.poNumber}</td>
                      <td className="px-4 py-3">{po.equipmentName}</td>
                      <td className="px-4 py-3">{po.vendorName}</td>
                      <td className="px-4 py-3 font-medium">{po.quantity}</td>
                      <td className="px-4 py-3 font-semibold">₹{po.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/purchase-orders/${po.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                          </Link>
                          {po.status === "draft" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => handleApprove(po.id)}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
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

