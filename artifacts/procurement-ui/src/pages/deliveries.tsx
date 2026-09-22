import { useState, useRef } from "react";
import { Link } from "wouter";
import { useListDeliveries, getListDeliveriesQueryKey, useListPurchaseOrders, useCreateDelivery, type Delivery } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Search, Eye, QrCode, Plus, Upload, FileText, X,
  CheckCircle2, Truck, Package, AlertTriangle, Building2, Stamp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface DocAttachment { name: string; size: string; docType: string; }

function fileSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

const DOC_TYPES = [
  { key: "delivery_note", label: "Delivery Note / Challan (DC)", accept: ".pdf,.jpg,.png", hint: "Original Delivery Note from vendor e.g. SSA/0506/25-26" },
  { key: "invoice_copy", label: "Vendor Invoice Copy", accept: ".pdf", hint: "GST Invoice with HSN/SAC codes" },
  { key: "packing_list", label: "Packing List", accept: ".pdf,.xls,.xlsx", hint: "Item-wise packing list with serial/batch nos." },
  { key: "test_cert", label: "Test / Calibration Certificates", accept: ".pdf", hint: "Factory test reports and calibration certs" },
  { key: "warranty", label: "Warranty Card / Document", accept: ".pdf,.jpg,.png", hint: "Warranty card from manufacturer" },
  { key: "manufacturer_auth", label: "Manufacturer Authorisation (Annexure-5)", accept: ".pdf", hint: "Manufacturer authorisation as per TID Annexure-5a/5b" },
  { key: "photos", label: "Unboxing / Arrival Photos", accept: ".jpg,.jpeg,.png,.zip", hint: "Photos of equipment at time of delivery" },
];

export default function Deliveries() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [logOpen, setLogOpen] = useState(false);
  const [detailDelivery, setDetailDelivery] = useState<Delivery | null>(null);

  const [form, setForm] = useState({
    purchaseOrderId: "",
    deliveryNoteNo: "",
    deliveryNoteDate: "",
    buyersOrderNo: "",
    buyersOrderDate: "",
    dispatchDocNo: "",
    dispatchedThrough: "",
    destination: "",
    termsOfDelivery: "",
    vehicleNumber: "",
    dispatchDate: "",
    hsnSacCode: "",
    gstRate: "5",
    receivedInGoodCondition: true,
    dispatchNotes: "",
    serialBatchNos: "",
    vendorGstin: "",
    consigneeAddress: "",
    buyerBillToAddress: "The Managing Director, HPC, Hyderabad, 2nd Floor, DM&HS Compound, Sultanbazar, Koti, HYDERABAD - 500095, GSTIN/UIN: 36AADAT9639G1Z2",
  });
  const [docs, setDocs] = useState<DocAttachment[]>([]);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const activeFilter = statusFilter !== "all" ? statusFilter : undefined;
  const { data: deliveries, isLoading } = useListDeliveries(
    activeFilter ? { status: activeFilter } : {},
    { query: { queryKey: getListDeliveriesQueryKey(activeFilter ? { status: activeFilter } : {}) } }
  );
  const { data: purchaseOrders } = useListPurchaseOrders({}, { query: { queryKey: ["purchase-orders"] } });
  const createDelivery = useCreateDelivery();

  const filtered = (deliveries ?? []).filter((d) =>
    !search ||
    d.qrCode.toLowerCase().includes(search.toLowerCase()) ||
    d.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.facilityName.toLowerCase().includes(search.toLowerCase()) ||
    d.equipmentName.toLowerCase().includes(search.toLowerCase())
  );

  function handleFileUpload(files: FileList | null, docType: string) {
    if (!files) return;
    const newDocs: DocAttachment[] = Array.from(files).map(f => ({ name: f.name, size: fileSize(f.size), docType }));
    setDocs(prev => [...prev, ...newDocs]);
  }

  function handleCreate() {
    if (!form.purchaseOrderId) return;
    createDelivery.mutate(
      { data: { purchaseOrderId: parseInt(form.purchaseOrderId), dispatchDate: form.dispatchDate || undefined } as Parameters<typeof createDelivery.mutate>[0]["data"] },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDeliveriesQueryKey({}) });
          setLogOpen(false);
          resetForm();
          setDocs([]);
        },
      }
    );
  }

  function resetForm() {
    setForm({
      purchaseOrderId: "", deliveryNoteNo: "", deliveryNoteDate: "", buyersOrderNo: "",
      buyersOrderDate: "", dispatchDocNo: "", dispatchedThrough: "", destination: "",
      termsOfDelivery: "", vehicleNumber: "", dispatchDate: "", hsnSacCode: "",
      gstRate: "5", receivedInGoodCondition: true, dispatchNotes: "", serialBatchNos: "",
      vendorGstin: "", consigneeAddress: "",
      buyerBillToAddress: "The Managing Director, HPC, Hyderabad, 2nd Floor, DM&HS Compound, Sultanbazar, Koti, HYDERABAD - 500095, GSTIN/UIN: 36AADAT9639G1Z2",
    });
  }

  function qaColor(score: number | null | undefined) {
    if (score == null) return "text-muted-foreground";
    if (score >= 100) return "text-emerald-600 font-semibold";
    if (score >= 80) return "text-amber-600 font-semibold";
    return "text-red-600 font-semibold";
  }

  const pendingQA = (deliveries ?? []).filter(d => d.status === "qa_pending").length;
  const qaPassed = (deliveries ?? []).filter(d => d.status === "qa_passed" || d.status === "accepted").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deliveries & QA</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track consignments from dispatch through QA acceptance — Delivery Note / DC / Annexure format</p>
        </div>
        {(can("grn.create") || can("installation.submit")) && (
          <Button size="sm" className="gap-2" onClick={() => setLogOpen(true)}>
            <Plus className="h-4 w-4" />Log Delivery
          </Button>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xl font-bold">{(deliveries ?? []).length}</p>
              <p className="text-xs text-muted-foreground">Total Deliveries</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xl font-bold text-amber-700">{pendingQA}</p>
              <p className="text-xs text-muted-foreground">QA Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xl font-bold text-emerald-700">{qaPassed}</p>
              <p className="text-xs text-muted-foreground">QA Passed / Accepted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4 flex items-center gap-3">
            <Stamp className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xl font-bold text-blue-700">{(deliveries ?? []).filter(d => d.acceptanceCertificateIssued).length}</p>
              <p className="text-xs text-muted-foreground">Acceptance Cert Issued</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by Delivery Note, PO, facility, equipment..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="qa_pending">QA Pending</SelectItem>
                <SelectItem value="qa_passed">QA Passed</SelectItem>
                <SelectItem value="qa_failed">QA Failed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Delivery Note No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">PO (Buyer's Order) No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Equipment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Consignee (Facility)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Qty (Nos.)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Dispatch Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">QA Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Docs</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">No deliveries found</td></tr>
                  ) : filtered.map((d) => (
                    <tr key={d.id} className="border-b hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setDetailDelivery(d as typeof detailDelivery)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-mono text-xs font-semibold text-amber-700">{d.qrCode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{d.poNumber}</td>
                      <td className="px-4 py-3 text-xs max-w-[150px] truncate">{d.equipmentName}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.facilityName}</td>
                      <td className="px-4 py-3 text-xs font-semibold">{d.quantity} Nos.</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{d.dispatchDate ? format(new Date(d.dispatchDate), "dd MMM yyyy") : "—"}</td>
                      <td className={cn("px-4 py-3 text-xs", qaColor(d.qaComplianceScore))}>{d.qaComplianceScore != null ? `${d.qaComplianceScore}%` : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-medium", d.documentsUploaded ? "text-emerald-600" : "text-amber-600")}>
                          {d.documentsUploaded ? "✓ Uploaded" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <Link href={`/deliveries/${d.id}`}>
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

      {/* Delivery Detail Quick View */}
      <Dialog open={!!detailDelivery} onOpenChange={() => setDetailDelivery(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          {detailDelivery && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Delivery Note: {detailDelivery.qrCode}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2 text-sm">
                {/* Delivery Note Header (mirrors real doc format) */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/40 px-4 py-2 border-b flex items-center justify-between">
                    <span className="font-bold text-sm">DELIVERY NOTE</span>
                    <span className="text-xs text-muted-foreground">(Original for Consignee)</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <div>
                        <p className="text-muted-foreground">Delivery Note No.</p>
                        <p className="font-bold text-amber-700 font-mono">{detailDelivery.qrCode}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Buyer's Order No. (PO)</p>
                        <p className="font-semibold font-mono text-primary">{detailDelivery.poNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dispatched Through</p>
                        <p className="font-medium">{detailDelivery.qrCode.includes("SSA") ? "Self / Company Vehicle" : "Company Vehicle"}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-muted-foreground">Delivery Date</p>
                        <p className="font-semibold">{detailDelivery.deliveredDate ? format(new Date(detailDelivery.deliveredDate), "dd-MMM-yyyy") : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dispatch Date</p>
                        <p className="font-medium">{detailDelivery.dispatchDate ? format(new Date(detailDelivery.dispatchDate), "dd-MMM-yyyy") : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Qty (Total Nos.)</p>
                        <p className="font-bold">{detailDelivery.quantity} Nos.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consignee & Buyer */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Building2 className="h-3.5 w-3.5 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-700">Consignee (Ship to)</p>
                    </div>
                    <p className="text-xs font-semibold">The Medical Superintendent</p>
                    <p className="text-xs text-muted-foreground">{detailDelivery.facilityName}</p>
                    <p className="text-xs text-muted-foreground">State</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="text-xs font-semibold text-emerald-700">Buyer (Bill to)</p>
                    </div>
                    <p className="text-xs font-semibold">The Managing Director, HPC, Hyderabad</p>
                    <p className="text-xs text-muted-foreground">2nd Floor, DM&HS Compound, Sultanbazar, Koti</p>
                    <p className="text-xs text-muted-foreground">HYDERABAD - 500095</p>
                    <p className="text-xs font-mono text-muted-foreground">GSTIN: 36AADAT9639G1Z2</p>
                  </div>
                </div>

                {/* Vendor */}
                <div className="border rounded-lg p-3">
                  <p className="text-xs font-semibold mb-1 text-purple-700">Vendor (Supplier)</p>
                  <p className="text-xs font-semibold">{detailDelivery.vendorName}</p>
                </div>

                {/* QA Notes */}
                {detailDelivery.qaNotes && (
                  <div className="border rounded-lg p-3 bg-muted/20">
                    <p className="text-xs font-semibold mb-1.5">QA Notes / Inspection Details</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{detailDelivery.qaNotes}</p>
                  </div>
                )}

                {/* Received in Good Condition */}
                <div className={cn("border rounded-lg p-3 flex items-center gap-3", detailDelivery.qaComplianceScore === 100 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
                  {detailDelivery.qaComplianceScore === 100
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    : <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />}
                  <div>
                    <p className="text-xs font-semibold">
                      {detailDelivery.qaComplianceScore === 100 ? "Recd. in Good Condition" : "Condition: Requires Attention"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">QA Score: {detailDelivery.qaComplianceScore != null ? `${detailDelivery.qaComplianceScore}%` : "Pending"}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={detailDelivery.status} />
                  {detailDelivery.acceptanceCertificateIssued && (
                    <Badge className="bg-blue-600 text-white text-xs">Acceptance Certificate Issued</Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Log Delivery Dialog — Delivery Note format */}
      <Dialog open={logOpen} onOpenChange={v => { setLogOpen(v); if (!v) { setDocs([]); resetForm(); } }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />Log Delivery — Delivery Note Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">

            {/* Section: PO & Delivery Note */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Purchase Order & Delivery Note</p>
              <div className="space-y-1.5">
                <Label>Purchase Order *</Label>
                <Select value={form.purchaseOrderId} onValueChange={v => setForm({ ...form, purchaseOrderId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a PO..." /></SelectTrigger>
                  <SelectContent>
                    {(purchaseOrders ?? []).map(po => (
                      <SelectItem key={po.id} value={String(po.id)}>
                        {po.poNumber} — {po.equipmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Delivery Note No. *</Label>
                  <Input value={form.deliveryNoteNo} onChange={e => setForm({ ...form, deliveryNoteNo: e.target.value })} placeholder="e.g. SSA/0506/25-26" />
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery Note Date</Label>
                  <Input type="date" value={form.deliveryNoteDate} onChange={e => setForm({ ...form, deliveryNoteDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Buyer's Order No. (PO Ref.)</Label>
                  <Input value={form.buyersOrderNo} onChange={e => setForm({ ...form, buyersOrderNo: e.target.value })} placeholder="441A/591/HPC/EQU/2025-26" />
                </div>
                <div className="space-y-1.5">
                  <Label>Buyer's Order Date</Label>
                  <Input type="date" value={form.buyersOrderDate} onChange={e => setForm({ ...form, buyersOrderDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Dispatch Doc No.</Label>
                  <Input value={form.dispatchDocNo} onChange={e => setForm({ ...form, dispatchDocNo: e.target.value })} placeholder="Dispatch document reference" />
                </div>
                <div className="space-y-1.5">
                  <Label>Dispatch Date</Label>
                  <Input type="date" value={form.dispatchDate} onChange={e => setForm({ ...form, dispatchDate: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Section: Consignee & Buyer */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Consignee & Buyer Details</p>
              <div className="space-y-1.5">
                <Label>Consignee Address (Ship to)</Label>
                <Textarea value={form.consigneeAddress} onChange={e => setForm({ ...form, consigneeAddress: e.target.value })} rows={2}
                  placeholder="The Medical Superintendent, GGH, Sangareddy, Sangareddy - 502001, Medak Dist." />
              </div>
              <div className="space-y-1.5">
                <Label>Buyer (Bill to) — HPC</Label>
                <Textarea value={form.buyerBillToAddress} onChange={e => setForm({ ...form, buyerBillToAddress: e.target.value })} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Vendor GSTIN</Label>
                <Input value={form.vendorGstin} onChange={e => setForm({ ...form, vendorGstin: e.target.value })} placeholder="e.g. 36ACWFS9933Q1ZO" />
              </div>
            </div>

            {/* Section: Transport */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dispatch / Transport Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Dispatched Through</Label>
                  <Input value={form.dispatchedThrough} onChange={e => setForm({ ...form, dispatchedThrough: e.target.value })} placeholder="e.g. Company Vehicle / Blue Dart" />
                </div>
                <div className="space-y-1.5">
                  <Label>Vehicle / Transport No.</Label>
                  <Input value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="e.g. TS-09-AB-1234" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Destination</Label>
                  <Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="Hospital name / address" />
                </div>
                <div className="space-y-1.5">
                  <Label>Terms of Delivery</Label>
                  <Input value={form.termsOfDelivery} onChange={e => setForm({ ...form, termsOfDelivery: e.target.value })} placeholder="e.g. FOR Destination / Ex-works" />
                </div>
              </div>
            </div>

            {/* Section: Item Details */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item / Equipment Details</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>HSN / SAC Code</Label>
                  <Input value={form.hsnSacCode} onChange={e => setForm({ ...form, hsnSacCode: e.target.value })} placeholder="e.g. 90189099" />
                </div>
                <div className="space-y-1.5">
                  <Label>GST Rate (%)</Label>
                  <Select value={form.gstRate} onValueChange={v => setForm({ ...form, gstRate: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% — Exempt</SelectItem>
                      <SelectItem value="5">5% — Medical Equipment</SelectItem>
                      <SelectItem value="12">12% — Standard</SelectItem>
                      <SelectItem value="18">18% — Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tax Amount</Label>
                  <Input placeholder="NIL (if exempt)" defaultValue="NIL" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Serial / Batch Numbers</Label>
                <Textarea value={form.serialBatchNos} onChange={e => setForm({ ...form, serialBatchNos: e.target.value })} rows={2}
                  placeholder="e.g. Batch: SP426A04AL (1 No), SP426A05L (1 No), SP426A05Q (1 No)" />
              </div>
              <div className="space-y-1.5">
                <Label>Dispatch Notes</Label>
                <Textarea value={form.dispatchNotes} onChange={e => setForm({ ...form, dispatchNotes: e.target.value })} rows={2} placeholder="Any notes about this dispatch..." />
              </div>
            </div>

            {/* Good Condition Checkbox */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
              <input
                type="checkbox"
                id="good_cond"
                checked={form.receivedInGoodCondition}
                onChange={e => setForm({ ...form, receivedInGoodCondition: e.target.checked })}
                className="h-4 w-4 accent-emerald-600"
              />
              <label htmlFor="good_cond" className="text-sm font-medium text-emerald-800">
                Recd. in Good Condition (facility store stamp confirmation)
              </label>
            </div>

            {/* Document uploads */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2"><Upload className="h-4 w-4" />Upload Dispatch Documents</p>
              <div className="grid grid-cols-1 gap-2">
                {DOC_TYPES.map(dt => {
                  const uploaded = docs.filter(d => d.docType === dt.key);
                  return (
                    <label key={dt.key} className="block cursor-pointer">
                      <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors hover:bg-muted/30 ${uploaded.length > 0 ? "border-emerald-200 bg-emerald-50" : "border-dashed border-muted-foreground/30"}`}>
                        {uploaded.length > 0
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          : <Upload className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <div className="flex-1">
                          <p className="text-xs font-medium">{dt.label}</p>
                          <p className="text-[10px] text-muted-foreground">{dt.hint}</p>
                          {uploaded.length > 0 && <p className="text-[10px] text-emerald-700">{uploaded.map(d => d.name).join(", ")}</p>}
                        </div>
                        <span className="text-xs text-primary border border-primary/30 rounded px-2 py-0.5">
                          {uploaded.length > 0 ? "Change" : "Browse"}
                        </span>
                      </div>
                      <input
                        type="file" accept={dt.accept} className="hidden"
                        ref={el => { fileRefs.current[dt.key] = el; }}
                        onChange={e => handleFileUpload(e.target.files, dt.key)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {docs.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Attached files ({docs.length})</p>
                {docs.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-muted/30 rounded px-2 py-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{d.name}</span>
                    <span className="text-muted-foreground">{d.size}</span>
                    <button onClick={() => setDocs(prev => prev.filter((_, j) => j !== i))}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLogOpen(false); setDocs([]); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.purchaseOrderId || createDelivery.isPending}>
              {createDelivery.isPending ? "Logging..." : "Log Delivery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
