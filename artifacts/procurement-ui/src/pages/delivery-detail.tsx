import { useRoute, Link } from "wouter";
import { useGetDelivery, getGetDeliveryQueryKey, useUpdateDelivery, useAcceptDelivery } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, AlertCircle, CheckCircle2, QrCode, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DeliveryDetail() {
  const [, params] = useRoute("/deliveries/:id");
  const id = parseInt(params?.id ?? "0");
  const queryClient = useQueryClient();
  const { data: delivery, isLoading } = useGetDelivery(id, { query: { enabled: !!id, queryKey: getGetDeliveryQueryKey(id) } });
  const updateDelivery = useUpdateDelivery();
  const acceptDelivery = useAcceptDelivery();

  const [qaScore, setQaScore] = useState("");
  const [qaNotes, setQaNotes] = useState("");
  const [discrepancyNotes, setDiscrepancyNotes] = useState("");
  const [deliveredDate, setDeliveredDate] = useState("");

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!delivery) return <div className="text-center py-20 text-muted-foreground">Delivery not found</div>;

  const qaScore100 = delivery.qaComplianceScore != null && delivery.qaComplianceScore >= 100;
  const docsOk = delivery.documentsUploaded;
  const canAccept = qaScore100 && docsOk && delivery.status !== "accepted";

  function handleMarkDelivered() {
    updateDelivery.mutate({ id, data: { status: "delivered", deliveredDate: deliveredDate || new Date().toISOString() } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetDeliveryQueryKey(id) })
    });
  }

  function handleQAUpdate() {
    const score = parseFloat(qaScore);
    const newStatus = score >= 100 ? "qa_passed" : "qa_failed";
    updateDelivery.mutate({ id, data: { qaComplianceScore: score, qaNotes, discrepancyNotes, status: newStatus } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetDeliveryQueryKey(id) }); setQaScore(""); setQaNotes(""); }
    });
  }

  function handleDocuments() {
    updateDelivery.mutate({ id, data: { documentsUploaded: true } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetDeliveryQueryKey(id) })
    });
  }

  function handleAccept() {
    acceptDelivery.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetDeliveryQueryKey(id) })
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/deliveries"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-bold font-mono">{delivery.qrCode}</h1>
          </div>
          <p className="text-sm text-muted-foreground">Delivery Record</p>
        </div>
        <div className="ml-auto"><StatusBadge status={delivery.status} /></div>
      </div>

      {/* Blocking alerts */}
      {!qaScore100 && delivery.status === "qa_failed" && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">QA Non-Compliance Alert</p>
            <p className="text-sm text-red-700 mt-0.5">Equipment does not meet 100% specification compliance. Acceptance is blocked. QA Score: {delivery.qaComplianceScore}%</p>
          </div>
        </div>
      )}
      {!docsOk && delivery.status !== "accepted" && (
        <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">Mandatory documents (certificates, accreditation) must be uploaded before acceptance.</p>
        </div>
      )}
      {delivery.status === "accepted" && (
        <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Acceptance Certificate Issued</p>
            <p className="text-sm text-emerald-700 mt-0.5">Equipment accepted. QA compliance: 100%. All documentation verified.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Consignment Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <DR label="PO Number" value={delivery.poNumber} />
            <DR label="Equipment" value={delivery.equipmentName} />
            <DR label="Vendor" value={delivery.vendorName} />
            <DR label="Destination Facility" value={delivery.facilityName} />
            <DR label="Quantity" value={String(delivery.quantity)} />
            <DR label="Dispatch Date" value={delivery.dispatchDate ? format(new Date(delivery.dispatchDate), "dd MMM yyyy") : "—"} />
            <DR label="Delivered Date" value={delivery.deliveredDate ? format(new Date(delivery.deliveredDate), "dd MMM yyyy") : "Pending"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">QA & Documentation Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-muted">
              <span className="text-sm text-muted-foreground">QA Compliance Score</span>
              <span className={cn("text-sm font-bold", qaScore100 ? "text-emerald-600" : delivery.qaComplianceScore != null ? "text-red-600" : "text-muted-foreground")}>
                {delivery.qaComplianceScore != null ? `${delivery.qaComplianceScore}%` : "Not assessed"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-muted">
              <span className="text-sm text-muted-foreground">Documents Uploaded</span>
              <span className={cn("text-sm font-semibold", docsOk ? "text-emerald-600" : "text-amber-600")}>{docsOk ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Acceptance Certificate</span>
              <span className={cn("text-sm font-semibold", delivery.acceptanceCertificateIssued ? "text-emerald-600" : "text-muted-foreground")}>
                {delivery.acceptanceCertificateIssued ? "Issued" : "Not issued"}
              </span>
            </div>
            {delivery.qaNotes && (
              <div className="pt-2 border-t border-muted">
                <p className="text-xs text-muted-foreground mb-1">QA Notes</p>
                <p className="text-sm">{delivery.qaNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {delivery.status !== "accepted" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mark delivered */}
          {(delivery.status === "dispatched" || delivery.status === "in_transit") && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Mark as Delivered</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Delivery Date</Label>
                  <Input type="date" value={deliveredDate} onChange={(e) => setDeliveredDate(e.target.value)} className="mt-1" />
                </div>
                <Button size="sm" onClick={handleMarkDelivered} disabled={updateDelivery.isPending} className="w-full">
                  {updateDelivery.isPending ? "Saving..." : "Mark Delivered"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* QA Verification */}
          {(delivery.status === "delivered" || delivery.status === "qa_pending" || delivery.status === "qa_failed") && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">QA Verification</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">QA Compliance Score (%)</Label>
                  <Input type="number" min="0" max="100" value={qaScore} onChange={(e) => setQaScore(e.target.value)} placeholder="0–100" className="mt-1" />
                  {qaScore && parseFloat(qaScore) < 100 && (
                    <p className="text-xs text-red-600 mt-1">Score below 100% will flag non-compliance and block acceptance.</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">QA Notes</Label>
                  <Textarea value={qaNotes} onChange={(e) => setQaNotes(e.target.value)} rows={2} className="mt-1" />
                </div>
                <Button size="sm" onClick={handleQAUpdate} disabled={updateDelivery.isPending || !qaScore} className="w-full">
                  Submit QA Result
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Document upload */}
          {!docsOk && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Document Upload</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {["Test Certificate", "Calibration Certificate", "Accreditation Docs", "Warranty Card"].map((doc) => (
                    <div key={doc} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      {doc}
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={handleDocuments} disabled={updateDelivery.isPending} className="w-full">
                  {updateDelivery.isPending ? "Confirming..." : "Confirm Documents Uploaded"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Acceptance */}
          <Card className={cn(!canAccept && "opacity-60")}>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Issue Acceptance Certificate</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <CheckItem label="QA 100% Compliant" done={qaScore100} />
                <CheckItem label="Documents Uploaded" done={docsOk} />
              </div>
              <Button size="sm" className="w-full" disabled={!canAccept || acceptDelivery.isPending} onClick={handleAccept}>
                {acceptDelivery.isPending ? "Processing..." : "Issue Certificate"}
              </Button>
              {!canAccept && <p className="text-xs text-red-600">Complete all requirements above to enable acceptance.</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function DR({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-muted last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function CheckItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-400" />}
      <span className={done ? "text-emerald-700" : "text-red-600"}>{label}</span>
    </div>
  );
}
