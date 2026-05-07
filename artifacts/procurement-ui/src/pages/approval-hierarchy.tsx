import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Users, IndianRupee, Edit, CheckCircle2, AlertTriangle, ShieldCheck, Plus, Trash2 } from "lucide-react";

interface ApprovalLevel {
  id: number;
  level: number;
  role: string;
  roleLabel: string;
  minAmount: number;
  maxAmount: number | null;
  required: boolean;
  slaHours: number;
  escalationHours: number;
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  entityType: "indent" | "purchase_order" | "tender" | "invoice" | "payment";
  levels: ApprovalLevel[];
}

const INIT_WORKFLOWS: ApprovalWorkflow[] = [
  {
    id: "indent_approval",
    name: "Indent Approval",
    description: "Approval chain for procurement indents raised by facilities",
    entityType: "indent",
    levels: [
      { id: 1, level: 1, role: "biomedical_engineer", roleLabel: "Biomedical Engineer", minAmount: 0, maxAmount: null, required: true, slaHours: 48, escalationHours: 72 },
      { id: 2, level: 2, role: "gm", roleLabel: "General Manager", minAmount: 0, maxAmount: null, required: true, slaHours: 72, escalationHours: 96 },
    ],
  },
  {
    id: "po_approval",
    name: "Purchase Order Approval",
    description: "Multi-level approval for purchase order issuance",
    entityType: "purchase_order",
    levels: [
      { id: 3, level: 1, role: "biomedical_engineer", roleLabel: "Biomedical Engineer", minAmount: 0, maxAmount: 500000, required: true, slaHours: 24, escalationHours: 48 },
      { id: 4, level: 2, role: "finance", roleLabel: "Finance Officer", minAmount: 0, maxAmount: null, required: true, slaHours: 48, escalationHours: 72 },
      { id: 5, level: 3, role: "gm", roleLabel: "General Manager", minAmount: 500000, maxAmount: null, required: true, slaHours: 72, escalationHours: 120 },
    ],
  },
  {
    id: "payment_approval",
    name: "Payment Release",
    description: "Finance approval chain for vendor payment release",
    entityType: "payment",
    levels: [
      { id: 6, level: 1, role: "finance", roleLabel: "Finance Officer", minAmount: 0, maxAmount: null, required: true, slaHours: 48, escalationHours: 72 },
      { id: 7, level: 2, role: "gm", roleLabel: "General Manager", minAmount: 1000000, maxAmount: null, required: false, slaHours: 72, escalationHours: 120 },
    ],
  },
  {
    id: "invoice_approval",
    name: "Invoice Verification",
    description: "3-Way match review and invoice approval before payment initiation",
    entityType: "invoice",
    levels: [
      { id: 8, level: 1, role: "biomedical_engineer", roleLabel: "Biomedical Engineer", minAmount: 0, maxAmount: null, required: true, slaHours: 24, escalationHours: 48 },
      { id: 9, level: 2, role: "finance", roleLabel: "Finance Officer", minAmount: 0, maxAmount: null, required: true, slaHours: 48, escalationHours: 72 },
    ],
  },
];

const ROLE_OPTIONS = [
  { value: "indent_initiator", label: "Indent Initiator" },
  { value: "biomedical_engineer", label: "Biomedical Engineer" },
  { value: "finance", label: "Finance Officer" },
  { value: "gm", label: "General Manager" },
  { value: "facility_receiver", label: "Facility Receiver" },
];

const ENTITY_BADGE: Record<string, string> = {
  indent: "bg-blue-100 text-blue-700 border-blue-200",
  purchase_order: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tender: "bg-violet-100 text-violet-700 border-violet-200",
  invoice: "bg-amber-100 text-amber-700 border-amber-200",
  payment: "bg-red-100 text-red-700 border-red-200",
};

function fmt(n: number) { return n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${n.toLocaleString("en-IN")}`; }

export default function ApprovalHierarchy() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(INIT_WORKFLOWS);
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [editLevel, setEditLevel] = useState<ApprovalLevel | null>(null);
  const [saved, setSaved] = useState(false);

  const canEdit = user.role === "gm" || user.role === "finance";

  function handleSaveLevel() {
    if (!editLevel || !editingWorkflow) return;
    setEditingWorkflow(wf => {
      if (!wf) return wf;
      const levels = editLevel.id < 0
        ? [...wf.levels, { ...editLevel, id: Date.now() }]
        : wf.levels.map(l => l.id === editLevel.id ? editLevel : l);
      return { ...wf, levels };
    });
    setEditLevel(null);
  }

  function handleDeleteLevel(levelId: number) {
    setEditingWorkflow(wf => {
      if (!wf) return wf;
      return { ...wf, levels: wf.levels.filter(l => l.id !== levelId).map((l, i) => ({ ...l, level: i + 1 })) };
    });
  }

  function handleSaveWorkflow() {
    if (!editingWorkflow) return;
    setWorkflows(ws => ws.map(w => w.id === editingWorkflow.id ? editingWorkflow : w));
    setEditingWorkflow(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />Approval Hierarchy
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure multi-level approval workflows for all procurement entities</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4" />Workflow saved successfully
          </div>
        )}
      </div>

      {!canEdit && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          You have read-only access to approval hierarchy settings. Only the General Manager or Finance Officer can make changes.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div><p className="text-xl font-bold">{workflows.length}</p><p className="text-xs text-muted-foreground">Approval Workflows</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div><p className="text-xl font-bold">{new Set(workflows.flatMap(w => w.levels.map(l => l.role))).size}</p><p className="text-xs text-muted-foreground">Roles Involved</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
            <div><p className="text-xl font-bold">₹5L</p><p className="text-xs text-muted-foreground">GM Approval Threshold</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div><p className="text-xl font-bold">96h</p><p className="text-xs text-muted-foreground">Max SLA (PO Approval)</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow cards */}
      <div className="space-y-4">
        {workflows.map(wf => (
          <Card key={wf.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{wf.name}</CardTitle>
                  <Badge variant="outline" className={`text-xs border ${ENTITY_BADGE[wf.entityType]}`}>
                    {wf.entityType.replace("_", " ")}
                  </Badge>
                </div>
                {canEdit && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditingWorkflow({ ...wf })}>
                    <Edit className="h-3.5 w-3.5" />Edit Workflow
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{wf.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-0">
                {wf.levels.map((level, i) => (
                  <div key={level.id} className="flex items-start">
                    <div className="flex flex-col items-center">
                      <div className="flex flex-col items-center bg-muted/30 rounded-xl p-3 border border-muted min-w-[140px]">
                        <div className="h-9 w-9 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-sm font-bold text-primary mb-2">
                          {level.level}
                        </div>
                        <p className="text-xs font-semibold text-center leading-tight">{level.roleLabel}</p>
                        <div className="mt-2 space-y-1 text-center">
                          <p className="text-[10px] text-muted-foreground">
                            Amount: {level.minAmount > 0 ? `${fmt(level.minAmount)}+` : "Any"}
                            {level.maxAmount ? ` – ${fmt(level.maxAmount)}` : ""}
                          </p>
                          <p className="text-[10px] text-muted-foreground">SLA: {level.slaHours}h</p>
                          <p className="text-[10px] text-muted-foreground">Escalate: {level.escalationHours}h</p>
                        </div>
                        <Badge variant="outline" className={`text-[9px] mt-2 ${level.required ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                          {level.required ? "Required" : "Conditional"}
                        </Badge>
                      </div>
                    </div>
                    {i < wf.levels.length - 1 && (
                      <div className="flex items-center mt-7 mx-1">
                        <div className="h-0.5 w-6 bg-primary/40" />
                        <div className="text-primary text-xs">→</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Workflow Dialog */}
      <Dialog open={!!editingWorkflow} onOpenChange={v => { if (!v) setEditingWorkflow(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingWorkflow && (
            <>
              <DialogHeader>
                <DialogTitle>Edit — {editingWorkflow.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Approval Levels</p>
                  {editingWorkflow.levels.map((level, i) => (
                    <div key={level.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                      <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                        {level.level}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{level.roleLabel}</p>
                        <div className="flex gap-4 mt-0.5 text-xs text-muted-foreground flex-wrap">
                          <span>SLA: {level.slaHours}h</span>
                          <span>Escalate at: {level.escalationHours}h</span>
                          <span>{level.required ? "Required" : "Conditional"}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditLevel(level)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => handleDeleteLevel(level.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 w-full"
                    onClick={() => setEditLevel({
                      id: -1, level: editingWorkflow.levels.length + 1,
                      role: "finance", roleLabel: "Finance Officer",
                      minAmount: 0, maxAmount: null, required: true, slaHours: 48, escalationHours: 72,
                    })}
                  >
                    <Plus className="h-3.5 w-3.5" />Add Approval Level
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingWorkflow(null)}>Cancel</Button>
                <Button onClick={handleSaveWorkflow}>Save Workflow</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Level Dialog */}
      <Dialog open={!!editLevel} onOpenChange={v => { if (!v) setEditLevel(null); }}>
        <DialogContent>
          {editLevel && (
            <>
              <DialogHeader><DialogTitle>{editLevel.id < 0 ? "Add" : "Edit"} Approval Level {editLevel.level}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={editLevel.role}
                    onValueChange={v => {
                      const opt = ROLE_OPTIONS.find(r => r.value === v);
                      setEditLevel(l => l ? { ...l, role: v, roleLabel: opt?.label ?? v } : l);
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Min Amount (₹)</Label>
                    <Input type="number" value={editLevel.minAmount} onChange={e => setEditLevel(l => l ? { ...l, minAmount: parseInt(e.target.value) || 0 } : l)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max Amount (₹) — blank = no limit</Label>
                    <Input type="number" value={editLevel.maxAmount ?? ""} placeholder="No limit" onChange={e => setEditLevel(l => l ? { ...l, maxAmount: e.target.value ? parseInt(e.target.value) : null } : l)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>SLA Hours</Label>
                    <Input type="number" value={editLevel.slaHours} onChange={e => setEditLevel(l => l ? { ...l, slaHours: parseInt(e.target.value) || 0 } : l)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Escalation Hours</Label>
                    <Input type="number" value={editLevel.escalationHours} onChange={e => setEditLevel(l => l ? { ...l, escalationHours: parseInt(e.target.value) || 0 } : l)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Requirement</Label>
                  <Select value={editLevel.required ? "required" : "conditional"} onValueChange={v => setEditLevel(l => l ? { ...l, required: v === "required" } : l)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="required">Required — always applies</SelectItem>
                      <SelectItem value="conditional">Conditional — amount threshold applies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditLevel(null)}>Cancel</Button>
                <Button onClick={handleSaveLevel}>Save Level</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
