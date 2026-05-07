import { useRoute, Link } from "wouter";
import { useGetRateContract, getGetRateContractQueryKey, useUpdateRateContract } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RateContractDetail() {
  const [, params] = useRoute("/rate-contracts/:id");
  const id = parseInt(params?.id ?? "0");
  const queryClient = useQueryClient();
  const { data: rc, isLoading } = useGetRateContract(id, { query: { enabled: !!id, queryKey: getGetRateContractQueryKey(id) } });
  const updateRC = useUpdateRateContract();
  const [closeOpen, setCloseOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [newEndDate, setNewEndDate] = useState("");

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!rc) return <div className="text-center py-20 text-muted-foreground">Rate contract not found</div>;

  const daysToExpiry = differenceInDays(new Date(rc.endDate), new Date());
  const isExpiring = daysToExpiry <= 60 && daysToExpiry >= 0;

  function handleClose() {
    updateRC.mutate({ id, data: { status: "closed" } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetRateContractQueryKey(id) }); setCloseOpen(false); }
    });
  }

  function handleRenew() {
    updateRC.mutate({ id, data: { status: "renewed", endDate: newEndDate } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetRateContractQueryKey(id) }); setRenewOpen(false); }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/rate-contracts"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div>
          <h1 className="text-2xl font-bold">{rc.contractNumber}</h1>
          <p className="text-sm text-muted-foreground">Rate Contract</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <StatusBadge status={rc.status} />
        </div>
      </div>

      {isExpiring && (
        <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">This contract expires in {daysToExpiry} days. Consider renewal.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Contract Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Equipment" value={rc.equipmentName} />
            <DetailRow label="Vendor" value={rc.vendorName} />
            <DetailRow label="Start Date" value={format(new Date(rc.startDate), "dd MMM yyyy")} />
            <DetailRow label="End Date" value={format(new Date(rc.endDate), "dd MMM yyyy")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Financial Terms</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Unit Price" value={`₹${rc.unitPrice.toLocaleString("en-IN")}`} />
            <DetailRow label="GST Rate" value={`${rc.gstRate}%`} />
            <DetailRow label="Effective Price" value={`₹${(rc.unitPrice * (1 + rc.gstRate / 100)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
            <DetailRow label="Warranty" value={`${rc.warrantyYears} year${rc.warrantyYears > 1 ? "s" : ""}`} />
            <DetailRow label="CMC Charges (annual)" value={`₹${rc.cmcCharges.toLocaleString("en-IN")} (from year ${rc.cmcStartYear})`} />
          </CardContent>
        </Card>
      </div>

      {rc.status === "active" && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Contract Management</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={() => setRenewOpen(true)}>Renew Contract</Button>
              <Button variant="outline" onClick={() => setCloseOpen(true)}>Close Contract</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Close Rate Contract</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Are you sure you want to close this rate contract? No new POs can be issued once closed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleClose} disabled={updateRC.isPending}>
              {updateRC.isPending ? "Closing..." : "Close Contract"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Renew Rate Contract</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">Select the new end date for the renewed contract.</p>
            <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewOpen(false)}>Cancel</Button>
            <Button onClick={handleRenew} disabled={updateRC.isPending || !newEndDate}>
              {updateRC.isPending ? "Renewing..." : "Renew"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-muted last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
