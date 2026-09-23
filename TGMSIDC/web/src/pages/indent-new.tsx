import { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useCreateIndent, useListInstitutions, useListEquipment, type CreateIndentBody } from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Upload, FileText, X, Plus, CheckCircle2,
  ChevronDown, ChevronUp, IndianRupee, AlertCircle, Package, ChevronsUpDown, Check,
  PackageCheck,
} from "lucide-react";
import { mockStockPositions } from "@/mocks/data";
import {
  PRODUCT_CATEGORIES, getProductCategory, getProductSpecs, getCategoryMeta,
} from "@/lib/productSpecs";
import { ProductSpecSheet } from "@/components/ProductSpecSheet";
import { cn } from "@/lib/utils";

interface SignatureHolder {
  name: string;
  designation: string;
  date: string;
}

interface LineItemDraft {
  localId: string;
  category: string;
  equipmentId: string;
  qty: string;
  unit: string;
  justification: string;
  specOpen: boolean;
  searchOpen: boolean;
}

// Helpers
let _counter = 0;
const newLineItem = (): LineItemDraft => ({
  localId: `li-${++_counter}`,
  category: "medical_equipment",
  equipmentId: "",
  qty: "1",
  unit: "No.",
  justification: "",
  specOpen: false,
  searchOpen: false,
});

const UNIT_OPTIONS = ["No.", "Lot", "Set", "Box", "Kg", "Litre", "Sq.m", "Running m"];

export default function IndentNew() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: institutions } = useListInstitutions();
  const { data: equipment } = useListEquipment();
  const createIndent = useCreateIndent();
  const scanRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    facilityId: "",
    urgency: "routine",
    budgetHead: "",
    digitisedBy: "Data Entry Operator",
    remarks: "",
  });

  const [lineItems, setLineItems] = useState<LineItemDraft[]>([newLineItem()]);
  const [scanFile, setScanFile] = useState<{ name: string; size: string } | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; type: string }[]>([]);
  const [signatories, setSignatories] = useState<SignatureHolder[]>([
    { name: "", designation: "Superintendent / Medical Officer", date: "" },
    { name: "", designation: "Biomedical Engineer", date: "" },
  ]);

  function handleScanUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const size = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setScanFile({ name: file.name, size });
    }
  }
  function handleAttachment(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setAttachments((prev) => [...prev, ...files.map((f) => ({ name: f.name, type: f.type }))]);
  }

  function addSignatory() {
    setSignatories((prev) => [...prev, { name: "", designation: "", date: "" }]);
  }
  function updateSignatory(idx: number, field: keyof SignatureHolder, value: string) {
    setSignatories((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }
  function removeSignatory(idx: number) {
    setSignatories((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(localId: string, patch: Partial<LineItemDraft>) {
    setLineItems((prev) => prev.map((li) => (li.localId === localId ? { ...li, ...patch } : li)));
  }
  function removeItem(localId: string) {
    setLineItems((prev) => prev.filter((li) => li.localId !== localId));
  }
  function addItem() {
    setLineItems((prev) => [...prev, newLineItem()]);
  }

  function getUnitRate(equipmentId: string): number {
    if (!equipmentId) return 0;
    return getProductSpecs(parseInt(equipmentId))?.estimatedUnitRate ?? 0;
  }
  function getItemTotal(li: LineItemDraft): number {
    return getUnitRate(li.equipmentId) * (parseInt(li.qty) || 0);
  }

  const completeItems = lineItems.filter((li) => li.equipmentId && (parseInt(li.qty) || 0) > 0);
  const grandTotal = completeItems.reduce((sum, li) => sum + getItemTotal(li), 0);

  const formatINR = (n: number) =>
    n >= 10_00_000
      ? `₹${(n / 10_00_000).toFixed(2)} Cr`
      : n >= 1_00_000
      ? `₹${(n / 1_00_000).toFixed(2)} L`
      : `₹${n.toLocaleString("en-IN")}`;

  const isValid = form.facilityId && completeItems.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const firstItem = completeItems[0];
    const technicalRequirements = completeItems
      .map((li) => {
        const eq = (equipment ?? []).find((e) => e.id === parseInt(li.equipmentId));
        return `${eq?.name ?? "?"} × ${li.qty} ${li.unit}: ${li.justification || "As per technical specification."}`;
      })
      .join("\n");

    const body: CreateIndentBody = {
      facilityId: parseInt(form.facilityId),
      equipmentId: parseInt(firstItem.equipmentId),
      quantity: completeItems.reduce((s, li) => s + (parseInt(li.qty) || 0), 0),
      technicalRequirements,
      digitisedBy: form.digitisedBy,
      budgetHead: form.budgetHead || undefined,
      urgency: form.urgency,
      remarks: form.remarks || undefined,
      lineItems: completeItems.map((li) => ({
        category: li.category,
        equipmentId: parseInt(li.equipmentId),
        equipmentName: (equipment ?? []).find((e) => e.id === parseInt(li.equipmentId))?.name ?? "",
        qty: parseInt(li.qty),
        unit: li.unit,
        estimatedUnitRate: getUnitRate(li.equipmentId),
        justification: li.justification || "As per technical specification.",
      })),
    };

    createIndent.mutate(
      { data: body },
      {
        onSuccess: (indent) => {
          queryClient.invalidateQueries({ queryKey: ["indents"] });
          navigate(`/indents/${indent.id}`);
        },
      }
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/indents">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Procurement Indent</h1>
          <p className="text-sm text-muted-foreground">Digitise a paper indent from a medical facility</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Scan upload */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              Scan Copy of Physical Indent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanFile ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{scanFile.name}</p>
                  <p className="text-xs text-muted-foreground">{scanFile.size}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setScanFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => scanRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Upload Scanned Indent Copy</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — signed physical indent with all key signatories</p>
                <Button type="button" variant="outline" size="sm" className="mt-3 border-blue-300">Browse Files</Button>
                <input ref={scanRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleScanUpload} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signatories */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Key Signature Holders</CardTitle>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addSignatory}>
                <Plus className="h-3.5 w-3.5" />Add Signatory
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {signatories.map((sig, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input value={sig.name} onChange={(e) => updateSignatory(idx, "name", e.target.value)} placeholder={`Signatory ${idx + 1}`} className="h-8 text-sm" />
                </div>
                <div className="col-span-5 space-y-1">
                  <Label className="text-xs">Designation</Label>
                  <Input value={sig.designation} onChange={(e) => updateSignatory(idx, "designation", e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={sig.date} onChange={(e) => updateSignatory(idx, "date", e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="col-span-1 pt-5">
                  {signatories.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeSignatory(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Indent details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Indent Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Requesting Facility *</Label>
                <Select value={form.facilityId} onValueChange={(v) => setForm({ ...form, facilityId: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select facility…" /></SelectTrigger>
                  <SelectContent>
                    {(institutions ?? []).map((inst) => (
                      <SelectItem key={inst.id} value={String(inst.id)}>
                        {inst.name} ({inst.district})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency Level</Label>
                <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical — Immediate patient safety risk</SelectItem>
                    <SelectItem value="essential">Essential — Required within 2 weeks</SelectItem>
                    <SelectItem value="routine">Routine — Planned procurement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Budget Head / Code</Label>
                <Input value={form.budgetHead} onChange={(e) => setForm({ ...form, budgetHead: e.target.value })} placeholder="e.g. BH-2526-001" className="mt-1.5" />
              </div>
              <div>
                <Label>Digitised By</Label>
                <Input value={form.digitisedBy} onChange={(e) => setForm({ ...form, digitisedBy: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Remarks / Special Instructions</Label>
              <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} className="mt-1.5 resize-none" placeholder="Any special conditions, delivery constraints, etc." />
            </div>
          </CardContent>
        </Card>

        {/* ── LINE ITEMS BUILDER ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Requested Products</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add one or more product line items. Search by product name or equipment code.
                </p>
              </div>
              {completeItems.length === 0 && (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">At least 1 line item required</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lineItems.map((li, idx) => {
              const catMeta = getCategoryMeta(li.category);
              const CatIcon = catMeta.icon;
              const unitRate = getUnitRate(li.equipmentId);
              const qty = parseInt(li.qty) || 0;
              const itemTotal = unitRate * qty;
              const selectedEq = (equipment ?? []).find((e) => e.id === parseInt(li.equipmentId));

              // Products in this category — searchable by name AND equipment code
              const filteredEquipment = (equipment ?? []).filter((e) => getProductCategory(e.id) === li.category);

              return (
                <div
                  key={li.localId}
                  className={cn(
                    "rounded-lg border p-4 space-y-3 relative",
                    catMeta.borderColor,
                  )}
                >
                  {/* Line label + remove */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      Line Item {idx + 1}
                    </span>
                    {lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(li.localId)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Category chips */}
                  <div>
                    <Label className="text-xs mb-1.5 block">Product Category *</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRODUCT_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = li.category === cat.value;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => updateItem(li.localId, { category: cat.value, equipmentId: "", specOpen: false, searchOpen: false })}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                              isActive
                                ? `${cat.bgColor} ${cat.color} ${cat.borderColor}`
                                : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Product search combobox + qty + unit */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-7">
                      <Label className="text-xs">Product (search by name or code) *</Label>
                      <Popover
                        open={li.searchOpen}
                        onOpenChange={(open) => updateItem(li.localId, { searchOpen: open })}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={li.searchOpen}
                            className={cn(
                              "mt-1 w-full justify-between h-9 font-normal text-sm",
                              !li.equipmentId && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {li.equipmentId
                                ? selectedEq?.name ?? "Select product…"
                                : filteredEquipment.length === 0
                                ? "No products in this category"
                                : "Search product…"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[340px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Type name or equipment code…" className="h-9" />
                            <CommandList>
                              <CommandEmpty>
                                <div className="flex flex-col items-center gap-1 py-3 text-center">
                                  <Package className="h-5 w-5 opacity-40" />
                                  <p className="text-sm text-muted-foreground">
                                    {filteredEquipment.length === 0
                                      ? "No products registered for this category."
                                      : "No matching products."}
                                  </p>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredEquipment.map((eq) => {
                                  const specs = getProductSpecs(eq.id);
                                  const isSelected = li.equipmentId === String(eq.id);
                                  return (
                                    <CommandItem
                                      key={eq.id}
                                      value={`${eq.name} ${eq.equipmentCode}`}
                                      onSelect={() => {
                                        updateItem(li.localId, {
                                          equipmentId: String(eq.id),
                                          searchOpen: false,
                                          specOpen: true,
                                        });
                                      }}
                                      className="flex items-start gap-2 py-2"
                                    >
                                      <Check className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-snug">{eq.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="font-mono text-[10px] text-primary">{eq.equipmentCode}</span>
                                          {specs && (
                                            <span className="text-[10px] text-muted-foreground">
                                              · Est. ₹{(specs.estimatedUnitRate / 1_00_000).toFixed(2)} L/unit
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={li.qty}
                        onChange={(e) => updateItem(li.localId, { qty: e.target.value })}
                        placeholder="Qty"
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Unit</Label>
                      <Select value={li.unit} onValueChange={(v) => updateItem(li.localId, { unit: v })}>
                        <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Estimated total row */}
                  {li.equipmentId && qty > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Est. unit rate:</span>
                      <span className="font-medium">₹{unitRate.toLocaleString("en-IN")}</span>
                      <span className="text-muted-foreground">×</span>
                      <span className="font-medium">{qty}</span>
                      <span className="text-muted-foreground">=</span>
                      <span className="font-bold text-foreground">{formatINR(itemTotal)}</span>
                    </div>
                  )}

                  {/* Stock Snapshot Panel */}
                  {li.equipmentId && form.facilityId && (() => {
                    const sp = mockStockPositions.find(
                      p => p.facilityId === parseInt(form.facilityId) && p.itemId === parseInt(li.equipmentId)
                    );
                    if (!sp) return null;
                    const riskConfig: Record<string, { cls: string; label: string }> = {
                      normal:                 { cls: "border-green-200 bg-green-50",  label: "Normal" },
                      warning:                { cls: "border-amber-200 bg-amber-50",  label: "Warning" },
                      high_risk:              { cls: "border-red-200 bg-red-50",      label: "High Risk" },
                      justification_required: { cls: "border-orange-200 bg-orange-50", label: "Overstock — Justification Required" },
                    };
                    const rc = riskConfig[sp.riskLevel] ?? riskConfig.normal;
                    const coverColor = sp.stockCoverDays === 0 ? "text-red-600 font-bold"
                      : sp.stockCoverDays < 30 ? "text-red-500 font-semibold"
                      : sp.stockCoverDays > 90 ? "text-amber-600 font-semibold"
                      : "text-emerald-700";
                    return (
                      <div className={`rounded-lg border p-3 ${rc.cls}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <PackageCheck className="h-3.5 w-3.5" />
                            Stock Snapshot — {sp.facilityName}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            sp.riskLevel === "high_risk" ? "bg-red-100 text-red-700 border-red-200"
                            : sp.riskLevel === "justification_required" ? "bg-orange-100 text-orange-700 border-orange-200"
                            : sp.riskLevel === "warning" ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-green-100 text-green-700 border-green-200"
                          }`}>{rc.label}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-3 text-xs">
                          {[
                            { label: "Usable Stock", value: `${sp.usableStock} ${sp.unit}` },
                            { label: "Near-Expiry", value: `${sp.nearExpiryStock} ${sp.unit}`, warn: sp.nearExpiryStock > 0 },
                            { label: "Avg Consumption / Month", value: `${sp.avgMonthlyConsumption} ${sp.unit}` },
                            { label: "Stock Cover", value: sp.stockCoverDays === 999 ? "∞ (capital item)" : `${sp.stockCoverDays} days`, coverColor: true },
                            { label: "Suggested Indent Qty", value: sp.suggestedIndentQty > 0 ? `${sp.suggestedIndentQty} ${sp.unit}` : "Not required" },
                          ].map(item => (
                            <div key={item.label}>
                              <p className="text-muted-foreground leading-tight">{item.label}</p>
                              <p className={`font-semibold mt-0.5 ${item.coverColor ? coverColor : item.warn ? "text-amber-700" : ""}`}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                        {sp.riskLevel === "justification_required" && (
                          <p className="text-xs text-orange-700 mt-2 font-medium">⚠ Existing stock exceeds 90-day cover. GM approval will require written justification for this indent.</p>
                        )}
                        {sp.riskLevel === "high_risk" && (
                          <p className="text-xs text-red-700 mt-2 font-medium">🔴 Stock critically low or zero. Mark urgency as Critical or Essential.</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Justification */}
                  <div>
                    <Label className="text-xs">Justification / Remarks</Label>
                    <Textarea
                      value={li.justification}
                      onChange={(e) => updateItem(li.localId, { justification: e.target.value })}
                      rows={2}
                      className="mt-1 resize-none text-sm"
                      placeholder="Why this product is needed, current equipment status, etc."
                    />
                  </div>

                  {/* Spec preview toggle */}
                  {li.equipmentId && (
                    <div>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border transition-colors w-full",
                          catMeta.color, catMeta.borderColor,
                          li.specOpen ? catMeta.bgColor : "bg-background hover:bg-muted/40"
                        )}
                        onClick={() => updateItem(li.localId, { specOpen: !li.specOpen })}
                      >
                        {li.specOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {li.specOpen ? "Hide" : "Preview"} Technical Specification Sheet
                        {!li.specOpen && (
                          <span className="ml-auto text-muted-foreground font-normal">
                            Verify you are selecting the correct product
                          </span>
                        )}
                      </button>

                      {li.specOpen && selectedEq && (
                        <div className="mt-2 border rounded-lg p-3 bg-background">
                          <ProductSpecSheet
                            equipmentId={selectedEq.id}
                            equipmentName={selectedEq.name}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add line item */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={addItem}
            >
              <Plus className="h-4 w-4" />
              Add Line Item
            </Button>

            {/* Running total */}
            {completeItems.length > 0 && (
              <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estimated Cost Summary</p>
                <div className="space-y-1.5">
                  {completeItems.map((li, idx) => {
                    const eq = (equipment ?? []).find((e) => e.id === parseInt(li.equipmentId));
                    return (
                      <div key={li.localId} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {idx + 1}. {eq?.name ?? "—"} × {li.qty} {li.unit}
                        </span>
                        <span className="font-medium tabular-nums">{formatINR(getItemTotal(li))}</span>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Total Estimated Value</span>
                  <span className="font-bold text-lg tabular-nums">{formatINR(grandTotal)}</span>
                </div>
                {grandTotal >= 5_00_000 && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
                    Value ≥ ₹5 L — Director-level sanction required. The approval workflow will include an Additional Director sign-off step.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supporting documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm flex-1 truncate">{att.name}</span>
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <label className="block">
              <div className="border border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/20 transition-colors">
                <p className="text-sm text-muted-foreground">Attach justification note, budget sanction, specification sheet…</p>
                <Button type="button" variant="outline" size="sm" className="mt-2 pointer-events-none">
                  <Upload className="h-3.5 w-3.5 mr-1.5" />Browse Files
                </Button>
              </div>
              <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={handleAttachment} />
            </label>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex gap-3 pt-2 items-center">
          <Button
            type="submit"
            disabled={createIndent.isPending || !isValid}
            className="gap-2"
          >
            {createIndent.isPending
              ? "Submitting…"
              : `Submit Indent${completeItems.length > 1 ? ` (${completeItems.length} items)` : ""}`}
          </Button>
          <Link href="/indents">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          {!isValid && (
            <p className="text-xs text-muted-foreground ml-2">
              {!form.facilityId ? "Select a requesting facility" : "Add at least one complete line item"}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
