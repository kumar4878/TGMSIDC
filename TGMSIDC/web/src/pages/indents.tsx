import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListIndents, getListIndentsQueryKey } from "@/lib/api-hooks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Eye, ChevronRight, Layers } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProgress } from "@/lib/approvalWorkflow";
import { useAuth } from "@/contexts/AuthContext";
import { getPendingIndentIdsForRole } from "@/lib/approvalWorkflow";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "linked_to_rc", label: "Linked to RC" },
  { value: "tender_initiated", label: "Tender Initiated" },
  { value: "po_issued", label: "PO Issued" },
];

function StepsBadge({ indentId, indentStatus }: { indentId: number; indentStatus: string }) {
  const progress = getProgress(indentId);
  if (progress.totalSteps === 0) return null;

  const isComplete = progress.isComplete || !["pending_approval"].includes(indentStatus);
  const isRejected = progress.isRejected || indentStatus === "rejected";

  return (
    <div className="flex items-center gap-2">
      {/* Step dots */}
      <div className="flex gap-0.5">
        {Array.from({ length: progress.totalSteps }).map((_, i) => {
          const done = i < progress.completedSteps;
          const active = i === progress.completedSteps && !isComplete && !isRejected;
          return (
            <div
              key={i}
              className={cn(
                "h-1.5 w-4 rounded-full",
                isRejected ? "bg-red-300" :
                done ? "bg-emerald-500" :
                active ? "bg-primary/60 animate-pulse" :
                "bg-muted"
              )}
            />
          );
        })}
      </div>
      {/* Explicit "Steps: X/Y" text */}
      <span className={cn(
        "text-[10px] font-semibold whitespace-nowrap",
        isRejected ? "text-red-600" :
        isComplete ? "text-emerald-600" :
        "text-muted-foreground"
      )}>
        {isRejected
          ? "Rejected"
          : isComplete
          ? `Steps: ${progress.totalSteps}/${progress.totalSteps}`
          : `Steps: ${progress.completedSteps}/${progress.totalSteps}`}
      </span>
    </div>
  );
}

export default function Indents() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const activeFilter = statusFilter !== "all" ? statusFilter : undefined;
  const { data: indents, isLoading } = useListIndents(
    activeFilter ? { status: activeFilter } : {},
    { query: { queryKey: getListIndentsQueryKey(activeFilter ? { status: activeFilter } : {}) } }
  );

  // Indents where this user's role has a pending step
  const myPendingIds = new Set(getPendingIndentIdsForRole(user.role));

  const filtered = (indents ?? []).filter((i) =>
    !search ||
    i.indentNumber.toLowerCase().includes(search.toLowerCase()) ||
    i.facilityName.toLowerCase().includes(search.toLowerCase()) ||
    i.equipmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Indents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Digitised procurement requests from medical facilities</p>
        </div>
        <Link href="/indents/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Indent
          </Button>
        </Link>
      </div>

      {/* Info banner for approvers */}
      {myPendingIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <span className="font-medium text-amber-800">
            You have {myPendingIds.size} indent{myPendingIds.size > 1 ? "s" : ""} awaiting your action.
          </span>
          <Link href="/approval-inbox">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 gap-1 h-7">
              Go to Approval Inbox <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search indents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-6 w-6 rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Indent No.</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Facility</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipment</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qty</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Approval Steps</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No indents found</td>
                    </tr>
                  ) : filtered.map((indent) => {
                    const myTurn = myPendingIds.has(indent.id);
                    return (
                      <tr
                        key={indent.id}
                        className={cn(
                          "border-b transition-colors cursor-pointer",
                          myTurn ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-muted/30"
                        )}
                        onClick={() => navigate(`/indents/${indent.id}`)}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-medium text-primary">{indent.indentNumber}</span>
                        </td>
                        <td className="px-4 py-3 text-foreground">{indent.facilityName}</td>
                        <td className="px-4 py-3 text-foreground">
                          <div className="flex items-center gap-2">
                            <span>{indent.equipmentName}</span>
                            {myTurn && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-300 text-amber-700 bg-amber-50 shrink-0">
                                Your Turn
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{indent.quantity}</td>
                        <td className="px-4 py-3">
                          <StepsBadge indentId={indent.id} indentStatus={indent.status} />
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={indent.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {format(new Date(indent.createdAt), "dd MMM yyyy")}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Link href={`/indents/${indent.id}`}>
                              <Button
                                variant={myTurn ? "default" : "ghost"}
                                size="sm"
                                className={cn("gap-1 h-8", myTurn ? "bg-primary text-white" : "")}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {myTurn ? "Review" : "View"}
                              </Button>
                            </Link>
                            <Link href={`/indents/${indent.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                title="View 360° lifecycle"
                              >
                                <Layers className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
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
