import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  // Indent statuses
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  pending_approval: { label: "Pending Approval", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", className: "bg-blue-100 text-blue-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  linked_to_rc: { label: "Linked to RC", className: "bg-indigo-100 text-indigo-800" },
  tender_initiated: { label: "Tender Initiated", className: "bg-purple-100 text-purple-800" },
  po_issued: { label: "PO Issued", className: "bg-emerald-100 text-emerald-800" },

  // RC statuses
  active: { label: "Active", className: "bg-emerald-100 text-emerald-800" },
  expired: { label: "Expired", className: "bg-red-100 text-red-800" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-700" },
  renewed: { label: "Renewed", className: "bg-blue-100 text-blue-800" },

  // PO statuses
  dispatched: { label: "Dispatched", className: "bg-blue-100 text-blue-800" },
  delivered: { label: "Delivered", className: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },

  // Tender statuses
  invited: { label: "Invited", className: "bg-blue-100 text-blue-800" },
  bids_received: { label: "Bids Received", className: "bg-purple-100 text-purple-800" },
  l1_identified: { label: "L1 Identified", className: "bg-indigo-100 text-indigo-800" },
  rc_created: { label: "RC Created", className: "bg-emerald-100 text-emerald-800" },

  // Delivery statuses
  in_transit: { label: "In Transit", className: "bg-blue-100 text-blue-800" },
  qa_pending: { label: "QA Pending", className: "bg-amber-100 text-amber-800" },
  qa_passed: { label: "QA Passed", className: "bg-emerald-100 text-emerald-800" },
  qa_failed: { label: "QA Failed", className: "bg-red-100 text-red-800" },
  accepted: { label: "Accepted", className: "bg-emerald-100 text-emerald-800" },

  // Vendor statuses
  suspended: { label: "Suspended", className: "bg-amber-100 text-amber-800" },
  blacklisted: { label: "Blacklisted", className: "bg-red-100 text-red-800" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
