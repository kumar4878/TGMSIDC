import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, Package, Wrench, BarChart3, ShieldCheck,
  Clock, FileText, ChevronDown, ChevronUp, Pencil, Save, X, Plus, Trash2,
} from "lucide-react";
import type { ProductTechSpecs } from "@/lib/productSpecs";
import { getProductSpecs, updateProductSpecs } from "@/lib/productSpecs";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon: Icon, iconColor = "text-primary", children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", iconColor)} />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

function SpecGrid({ fields }: { fields: Array<{ label: string; value: string | boolean | undefined | null }> }) {
  const visible = fields.filter((f) => f.value !== undefined && f.value !== null && f.value !== "");
  if (visible.length === 0) return <p className="text-xs text-muted-foreground">No data available.</p>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
      {visible.map(({ label, value }) => (
        <div key={label}>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-sm text-foreground mt-0.5 leading-snug">
            {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
          </p>
        </div>
      ))}
    </div>
  );
}

interface ProductSpecSheetProps {
  equipmentId: number;
  equipmentName: string;
  compact?: boolean;
  editable?: boolean;
}

export function ProductSpecSheet({ equipmentId, equipmentName, compact = false, editable = false }: ProductSpecSheetProps) {
  const [specs, setSpecs] = useState<ProductTechSpecs | null>(() => getProductSpecs(equipmentId));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProductTechSpecs | null>(null);

  if (!specs) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Wrench className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No detailed specifications available for this product yet.</p>
        <p className="text-xs mt-1">Contact the Equipment Cell to add structured specs.</p>
      </div>
    );
  }

  function startEdit() {
    setDraft(JSON.parse(JSON.stringify(specs)));
    setEditing(true);
  }
  function cancelEdit() {
    setDraft(null);
    setEditing(false);
  }
  function saveEdit() {
    if (!draft) return;
    updateProductSpecs(equipmentId, draft);
    setSpecs({ ...draft });
    setEditing(false);
    setDraft(null);
  }

  function patchGeneral(field: string, value: string) {
    if (!draft) return;
    setDraft({ ...draft, general: { ...draft.general, [field]: value } });
  }
  function patchTechnical(field: string, value: string) {
    if (!draft) return;
    setDraft({ ...draft, technical: { ...draft.technical, [field]: value } });
  }
  function patchWarranty(field: string, value: string) {
    if (!draft) return;
    const num = parseFloat(value) || 0;
    setDraft({ ...draft, warranty: { ...draft.warranty, [field]: num } });
  }
  function patchPerformanceKey(oldKey: string, newKey: string) {
    if (!draft) return;
    const entries = Object.entries(draft.performance);
    const idx = entries.findIndex(([k]) => k === oldKey);
    if (idx === -1) return;
    entries[idx] = [newKey, entries[idx][1]];
    setDraft({ ...draft, performance: Object.fromEntries(entries) });
  }
  function patchPerformanceValue(key: string, value: string) {
    if (!draft) return;
    setDraft({ ...draft, performance: { ...draft.performance, [key]: value } });
  }
  function addPerformanceRow() {
    if (!draft) return;
    const key = `New Parameter ${Object.keys(draft.performance).length + 1}`;
    setDraft({ ...draft, performance: { ...draft.performance, [key]: "" } });
  }
  function deletePerformanceRow(key: string) {
    if (!draft) return;
    const { [key]: _, ...rest } = draft.performance;
    setDraft({ ...draft, performance: rest });
  }
  function patchRegulatoryBool(field: keyof ProductTechSpecs["regulatory"], checked: boolean) {
    if (!draft) return;
    setDraft({ ...draft, regulatory: { ...draft.regulatory, [field]: checked } });
  }
  function patchRegulatoryStr(field: keyof ProductTechSpecs["regulatory"], value: string) {
    if (!draft) return;
    setDraft({ ...draft, regulatory: { ...draft.regulatory, [field]: value } });
  }
  function patchAccessory(idx: number, value: string) {
    if (!draft) return;
    const next = [...draft.accessories];
    next[idx] = value;
    setDraft({ ...draft, accessories: next });
  }
  function addAccessory() {
    if (!draft) return;
    setDraft({ ...draft, accessories: [...draft.accessories, ""] });
  }
  function deleteAccessory(idx: number) {
    if (!draft) return;
    setDraft({ ...draft, accessories: draft.accessories.filter((_, i) => i !== idx) });
  }
  function patchDoc(idx: number, value: string) {
    if (!draft) return;
    const next = [...draft.documentation];
    next[idx] = value;
    setDraft({ ...draft, documentation: next });
  }
  function addDoc() {
    if (!draft) return;
    setDraft({ ...draft, documentation: [...draft.documentation, ""] });
  }
  function deleteDoc(idx: number) {
    if (!draft) return;
    setDraft({ ...draft, documentation: draft.documentation.filter((_, i) => i !== idx) });
  }

  const current = editing && draft ? draft : specs;

  const formatINR = (n: number) =>
    n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">{equipmentName}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-[10px] capitalize">{current.subcategory.replace(/_/g, " ")}</Badge>
            <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
              Est. {formatINR(current.estimatedUnitRate)} / unit
            </Badge>
            {current.regulatory.ceMark && (
              <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-700">CE Mark</Badge>
            )}
            {current.regulatory.aerbClearance && (
              <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-700">AERB Required</Badge>
            )}
          </div>
        </div>
        {editable && !editing && (
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={startEdit}>
            <Pencil className="h-3.5 w-3.5" />Edit Specs
          </Button>
        )}
        {editing && (
          <div className="flex gap-2 shrink-0">
            <Button size="sm" className="gap-1.5" onClick={saveEdit}>
              <Save className="h-3.5 w-3.5" />Save
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={cancelEdit}>
              <X className="h-3.5 w-3.5" />Cancel
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* ── General ── */}
      <Section title="General" icon={FileText} defaultOpen={!compact}>
        {editing && draft ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["make", "model", "countryOfOrigin", "hsnCode", "standardReference"] as const).map((field) => (
              <div key={field}>
                <Label className="text-xs">{field === "hsnCode" ? "HSN/SAC Code" : field.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</Label>
                <Input value={draft.general[field] ?? ""} onChange={(e) => patchGeneral(field, e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
            ))}
          </div>
        ) : (
          <SpecGrid fields={[
            { label: "Make / Brand", value: current.general.make },
            { label: "Model", value: current.general.model },
            { label: "Country of Origin", value: current.general.countryOfOrigin },
            { label: "HSN/SAC Code", value: current.general.hsnCode },
            { label: "Standard Reference", value: current.general.standardReference },
          ]} />
        )}
      </Section>

      {/* ── Technical Parameters ── */}
      <Section title="Technical Parameters" icon={Wrench} iconColor="text-violet-600" defaultOpen={!compact}>
        {editing && draft ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["powerSupply", "powerConsumption", "dimensions", "weight", "operatingTemp", "humidity"] as const).map((field) => (
              <div key={field}>
                <Label className="text-xs">{field.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</Label>
                <Input value={draft.technical[field] ?? ""} onChange={(e) => patchTechnical(field, e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
            ))}
          </div>
        ) : (
          <SpecGrid fields={[
            { label: "Power Supply", value: current.technical.powerSupply },
            { label: "Power Consumption", value: current.technical.powerConsumption },
            { label: "Dimensions", value: current.technical.dimensions },
            { label: "Weight", value: current.technical.weight },
            { label: "Operating Temperature", value: current.technical.operatingTemp },
            { label: "Humidity Range", value: current.technical.humidity },
            ...Object.entries(current.technical.additionalFields ?? {}).map(([k, v]) => ({ label: k, value: v })),
          ]} />
        )}
      </Section>

      {/* ── Performance ── */}
      <Section title="Performance Specifications" icon={BarChart3} iconColor="text-emerald-600" defaultOpen>
        {editing && draft ? (
          <div className="space-y-2">
            {Object.entries(draft.performance).map(([key, value]) => (
              <div key={key} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    value={key}
                    onChange={(e) => patchPerformanceKey(key, e.target.value)}
                    className="h-8 text-xs font-medium"
                    placeholder="Parameter name"
                  />
                </div>
                <div className="col-span-6">
                  <Input
                    value={value}
                    onChange={(e) => patchPerformanceValue(key, e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Value"
                  />
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => deletePerformanceRow(key)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="mt-1 gap-1.5 text-xs" onClick={addPerformanceRow}>
              <Plus className="h-3 w-3" />Add Parameter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(current.performance).map(([key, value]) => (
              <div key={key}>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{key}</p>
                <p className="text-sm text-foreground mt-0.5 leading-snug">{value}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Regulatory & Compliance ── */}
      <Section title="Regulatory & Compliance" icon={ShieldCheck} iconColor="text-amber-600" defaultOpen={!compact}>
        {editing && draft ? (
          <div className="space-y-3">
            {/* Boolean fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["ceMark", "aerbClearance", "pcpndtCompliance"] as const).map((field) => {
                const labels: Record<string, string> = {
                  ceMark: "CE Mark",
                  aerbClearance: "AERB Clearance Required",
                  pcpndtCompliance: "PCPNDT Act Compliance",
                };
                return (
                  <div key={field} className="flex items-center gap-2">
                    <Checkbox
                      id={`reg-${field}`}
                      checked={!!draft.regulatory[field]}
                      onCheckedChange={(checked) => patchRegulatoryBool(field, !!checked)}
                    />
                    <Label htmlFor={`reg-${field}`} className="text-sm cursor-pointer">{labels[field]}</Label>
                  </div>
                );
              })}
            </div>
            {/* String fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(["bisIsiMark", "iecStandard", "iso"] as const).map((field) => {
                const labels: Record<string, string> = {
                  bisIsiMark: "BIS / ISI Mark",
                  iecStandard: "IEC Standard",
                  iso: "ISO Certification",
                };
                return (
                  <div key={field}>
                    <Label className="text-xs">{labels[field]}</Label>
                    <Input
                      value={(draft.regulatory[field] as string | undefined) ?? ""}
                      onChange={(e) => patchRegulatoryStr(field, e.target.value)}
                      className="mt-1 h-8 text-sm"
                      placeholder={`e.g. ${field === "iecStandard" ? "IEC 60601-1" : field === "iso" ? "ISO 13485" : "BIS IS 7620"}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <SpecGrid fields={[
            { label: "CE Mark", value: current.regulatory.ceMark },
            { label: "BIS / ISI Mark", value: current.regulatory.bisIsiMark },
            { label: "IEC Standard", value: current.regulatory.iecStandard },
            { label: "ISO Certification", value: current.regulatory.iso },
            { label: "AERB Clearance Required", value: current.regulatory.aerbClearance },
            { label: "PCPNDT Act Compliance", value: current.regulatory.pcpndtCompliance },
          ]} />
        )}
      </Section>

      {/* ── Accessories & Consumables ── */}
      {!compact && (
        <Section title="Accessories & Consumables Included" icon={Package} iconColor="text-orange-600" defaultOpen={false}>
          {editing && draft ? (
            <div className="space-y-2">
              {draft.accessories.map((acc, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={acc}
                    onChange={(e) => patchAccessory(i, e.target.value)}
                    className="h-8 text-sm flex-1"
                    placeholder="Accessory description"
                  />
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteAccessory(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-1 gap-1.5 text-xs" onClick={addAccessory}>
                <Plus className="h-3 w-3" />Add Accessory
              </Button>
            </div>
          ) : (
            current.accessories.length === 0 ? (
              <p className="text-xs text-muted-foreground">No accessories listed.</p>
            ) : (
              <ul className="space-y-1">
                {current.accessories.map((acc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {acc}
                  </li>
                ))}
              </ul>
            )
          )}
        </Section>
      )}

      {/* ── Warranty & CMC ── */}
      <Section title="Warranty & CMC" icon={Clock} iconColor="text-blue-600" defaultOpen={!compact}>
        {editing && draft ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Warranty Years</Label>
              <Input type="number" value={draft.warranty.years} onChange={(e) => patchWarranty("years", e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">CMC Start Year</Label>
              <Input type="number" value={draft.warranty.cmcStartYear} onChange={(e) => patchWarranty("cmcStartYear", e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">CMC Annual Rate (₹)</Label>
              <Input type="number" value={draft.warranty.cmcAnnualRate} onChange={(e) => patchWarranty("cmcAnnualRate", e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
          </div>
        ) : (
          <SpecGrid fields={[
            { label: "Warranty Period", value: `${current.warranty.years} years (from installation date)` },
            { label: "CMC Commences (Year)", value: `Year ${current.warranty.cmcStartYear}` },
            { label: "CMC Rate (Annual)", value: `₹${current.warranty.cmcAnnualRate.toLocaleString("en-IN")} per year` },
          ]} />
        )}
      </Section>

      {/* ── Documentation Required ── */}
      {!compact && (
        <Section title="Documentation Required" icon={FileText} defaultOpen={false}>
          {editing && draft ? (
            <div className="space-y-2">
              {draft.documentation.map((doc, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={doc}
                    onChange={(e) => patchDoc(i, e.target.value)}
                    className="h-8 text-sm flex-1"
                    placeholder="Document name / description"
                  />
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteDoc(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-1 gap-1.5 text-xs" onClick={addDoc}>
                <Plus className="h-3 w-3" />Add Document
              </Button>
            </div>
          ) : (
            current.documentation.length === 0 ? (
              <p className="text-xs text-muted-foreground">No documentation listed.</p>
            ) : (
              <ul className="space-y-1">
                {current.documentation.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <FileText className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            )
          )}
        </Section>
      )}
    </div>
  );
}
