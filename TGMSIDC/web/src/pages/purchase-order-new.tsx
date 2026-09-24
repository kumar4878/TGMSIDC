import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCreatePurchaseOrder, useListIndents, useListRateContracts } from "@/lib/api-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function PurchaseOrderNew() {
  const [, navigate] = useLocation();
  const { data: indents } = useListIndents({ status: "linked_to_rc" });
  const { data: rcs } = useListRateContracts({ status: "active" });
  const createPO = useCreatePurchaseOrder();

  const [form, setForm] = useState({ indentId: "", rateContractId: "", quantity: "", deliveryAddress: "", expectedDeliveryDate: "" });
  const f = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const valid = form.indentId && form.rateContractId && form.quantity && form.deliveryAddress && form.expectedDeliveryDate;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createPO.mutate({
      data: {
        indentId: form.indentId,
        rateContractId: form.rateContractId,
        quantity: parseInt(form.quantity),
        deliveryAddress: form.deliveryAddress,
        expectedDeliveryDate: form.expectedDeliveryDate,
      }
    }, { onSuccess: (po) => navigate(`/purchase-orders/${po.id}`) });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/purchase-orders"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div>
          <h1 className="text-2xl font-bold">New Purchase Order</h1>
          <p className="text-sm text-muted-foreground">Issue a purchase order from an approved indent and rate contract</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">PO Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Linked Indent *</Label>
              <Select value={form.indentId} onValueChange={(v) => f("indentId", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select approved indent..." /></SelectTrigger>
                <SelectContent>
                  {(indents ?? []).map((i) => <SelectItem key={i.id} value={String(i.id)}>{i.indentNumber} — {i.equipmentName} ({i.facilityName})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rate Contract *</Label>
              <Select value={form.rateContractId} onValueChange={(v) => f("rateContractId", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select active rate contract..." /></SelectTrigger>
                <SelectContent>
                  {(rcs ?? []).map((rc) => <SelectItem key={rc.id} value={String(rc.id)}>{rc.contractNumber} — {rc.equipmentName} @ ₹{rc.unitPrice.toLocaleString("en-IN")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity *</Label>
              <Input type="number" min="1" value={form.quantity} onChange={(e) => f("quantity", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Delivery Address *</Label>
              <Textarea value={form.deliveryAddress} onChange={(e) => f("deliveryAddress", e.target.value)} rows={2} className="mt-1.5" />
            </div>
            <div>
              <Label>Expected Delivery Date *</Label>
              <Input type="date" value={form.expectedDeliveryDate} onChange={(e) => f("expectedDeliveryDate", e.target.value)} className="mt-1.5" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createPO.isPending || !valid}>{createPO.isPending ? "Creating..." : "Issue Purchase Order"}</Button>
              <Link href="/purchase-orders"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
