import { useRoute, Link } from "wouter";
import { useGetPurchaseOrder, getGetPurchaseOrderQueryKey, useApprovePurchaseOrder, useCancelPurchaseOrder, useListDeliveries, getListDeliveriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function PurchaseOrderDetail() {
  const [, params] = useRoute("/purchase-orders/:id");
  const id = parseInt(params?.id ?? "0");
  const queryClient = useQueryClient();
  const { data: po, isLoading } = useGetPurchaseOrder(id, { query: { enabled: !!id, queryKey: getGetPurchaseOrderQueryKey(id) } });
  const { data: deliveries } = useListDeliveries({ poId: id }, { query: { enabled: !!id, queryKey: getListDeliveriesQueryKey({ poId: id }) } });
  const approvePO = useApprovePurchaseOrder();
  const cancelPO = useCancelPurchaseOrder();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!po) return <div className="text-center py-20 text-muted-foreground">PO not found</div>;

  function handleApprove() {
    approvePO.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPurchaseOrderQueryKey(id) }) });
  }

  function handleCancel() {
    if (!cancelReason.trim()) return;
    cancelPO.mutate({ id, data: { cancellationReason: cancelReason, cancelledBy: "Procurement Officer" } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetPurchaseOrderQueryKey(id) }); setCancelOpen(false); setCancelReason(""); }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/purchase-orders"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div>
          <h1 className="text-2xl font-bold">{po.poNumber}</h1>
          <p className="text-sm text-muted-foreground">Purchase Order</p>
        </div>
        <div className="ml-auto"><StatusBadge status={po.status} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <DR label="Equipment" value={po.equipmentName} />
            <DR label="Vendor" value={po.vendorName} />
            <DR label="Quantity" value={String(po.quantity)} />
            <DR label="Unit Price" value={`₹${po.unitPrice.toLocaleString("en-IN")}`} />
            <DR label="GST Rate" value={`${po.gstRate}%`} />
            <DR label="Total Amount" value={`₹${po.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Delivery Information</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <DR label="Delivery Address" value={po.deliveryAddress} />
            <DR label="Expected Delivery" value={po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), "dd MMM yyyy") : "Not set"} />
            <DR label="Actual Delivery" value={po.actualDeliveryDate ? format(new Date(po.actualDeliveryDate), "dd MMM yyyy") : "Pending"} />
            {po.cancellationReason && <DR label="Cancellation Reason" value={po.cancellationReason} />}
          </CardContent>
        </Card>
      </div>

      {/* Deliveries */}
      {deliveries && deliveries.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Deliveries</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">QR Code</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Facility</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qty</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">QA Score</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3"><Link href={`/deliveries/${d.id}`}><span className="font-mono text-xs text-primary hover:underline">{d.qrCode}</span></Link></td>
                    <td className="px-4 py-3">{d.facilityName}</td>
                    <td className="px-4 py-3">{d.quantity}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3">{d.qaComplianceScore != null ? `${d.qaComplianceScore}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {(po.status === "draft" || po.status === "approved") && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {po.status === "draft" && (
                <Button onClick={handleApprove} disabled={approvePO.isPending}>
                  {approvePO.isPending ? "Approving..." : "Approve PO"}
                </Button>
              )}
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>Cancel PO</Button>
              {po.status === "approved" && (
                <Link href="/deliveries"><Button variant="outline">Create Delivery Record</Button></Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Purchase Order</DialogTitle></DialogHeader>
          <div className="py-2">
            <Textarea placeholder="Reason for cancellation (required for audit trail)..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelPO.isPending || !cancelReason.trim()}>
              {cancelPO.isPending ? "Cancelling..." : "Cancel PO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DR({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-1 border-b border-muted last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right ml-4">{value}</span>
    </div>
  );
}
