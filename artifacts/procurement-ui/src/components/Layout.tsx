import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, FileCheck, ShoppingCart, Gavel,
  Truck, Users, Building2, Wrench, BarChart3, Bell, Menu,
  IndianRupee, Inbox, ClipboardList, Receipt, CreditCard, Layers, Merge,
  ChevronDown, LogOut, RefreshCw, Settings, ChevronRight,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useApprovalPendingCount, getPendingIndentIdsForRole } from "@/lib/approvalWorkflow";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavGroup { label: string; items: NavItem[]; }
interface NavItem  { href: string; label: string; icon: React.ElementType; }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Core",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/approval-inbox", label: "Approval Inbox", icon: Inbox },
    ],
  },
  {
    label: "Demand",
    items: [
      { href: "/indents", label: "Indents", icon: FileText },
      { href: "/consolidation", label: "Consolidation", icon: Merge },
      { href: "/budget", label: "Budget Register", icon: IndianRupee },
    ],
  },
  {
    label: "Procurement",
    items: [
      { href: "/rate-contracts", label: "Rate Contracts", icon: FileCheck },
      { href: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
      { href: "/tenders", label: "Tenders", icon: Gavel },
      { href: "/tenders/workbench", label: "Tender Workbench", icon: Layers },
    ],
  },
  {
    label: "Fulfilment",
    items: [
      { href: "/deliveries", label: "Deliveries & QA", icon: Truck },
      { href: "/grn", label: "GRN / Installation", icon: ClipboardList },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/invoices", label: "Invoices", icon: Receipt },
      { href: "/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "Masters",
    items: [
      { href: "/vendors", label: "Vendors", icon: Users },
      { href: "/institutions", label: "Institutions", icon: Building2 },
      { href: "/equipment", label: "Equipment Master", icon: Wrench },
      { href: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/approval-hierarchy", label: "Approval Hierarchy", icon: Settings },
    ],
  },
];

const ROLE_STYLE: Record<string, string> = {
  indent_initiator: "bg-blue-100 text-blue-700",
  biomedical_engineer: "bg-violet-100 text-violet-700",
  gm: "bg-emerald-100 text-emerald-700",
  director: "bg-amber-100 text-amber-700",
  finance: "bg-orange-100 text-orange-700",
  supplier: "bg-rose-100 text-rose-700",
  facility_receiver: "bg-teal-100 text-teal-700",
};

function NavBadge({ count, collapsed }: { count: number; collapsed: boolean }) {
  if (count === 0) return null;
  return (
    <span className={cn(
      "flex items-center justify-center rounded-full text-[10px] font-bold bg-red-500 text-white leading-none",
      collapsed ? "absolute -top-0.5 -right-0.5 h-3.5 w-3.5" : "h-4 min-w-4 px-1 ml-auto"
    )}>
      {count > 9 ? "9+" : count}
    </span>
  );
}

function NavItemEl({ href, label, icon: Icon, collapsed, badge }: NavItem & { collapsed: boolean; badge?: number }) {
  const [location] = useLocation();
  const isActive = href === "/" ? location === "/" : location.startsWith(href);

  const inner = (
    <Link href={href}>
      <div className={cn(
        "relative flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium",
        collapsed && "justify-center px-2",
        isActive
          ? "bg-sidebar-primary/20 text-sidebar-primary"
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      )}>
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate flex-1">{label}</span>}
        {!collapsed && isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50 shrink-0" />}
        {badge !== undefined && badge > 0 && <NavBadge count={badge} collapsed={collapsed} />}
      </div>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">{label}{badge ? ` (${badge})` : ""}</TooltipContent>
      </Tooltip>
    );
  }

  return inner;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, users, switchUser } = useAuth();
  const [, navigate] = useLocation();

  const pendingCount = useApprovalPendingCount(user.role);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-dvh bg-background overflow-hidden">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={cn(
          "fixed lg:relative z-50 flex flex-col bg-sidebar border-r border-sidebar-border h-full",
          "transition-[width] duration-200 ease-in-out shrink-0",
          collapsed ? "w-14" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          {/* Logo + collapse button */}
          <div className={cn(
            "flex items-center border-b border-sidebar-border shrink-0",
            collapsed ? "px-3 py-4 justify-center" : "gap-3 px-4 py-4"
          )}>
            <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">TG</span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sidebar-foreground font-semibold text-sm leading-tight truncate">TGMSIDC</div>
                <div className="text-sidebar-foreground/50 text-xs truncate">Procurement Portal</div>
              </div>
            )}
            {/* Desktop collapse/expand toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "hidden lg:flex items-center justify-center rounded-md p-1.5 transition-colors",
                "text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "mt-2 w-full"
              )}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed
                ? <PanelLeftOpen  className="h-4 w-4" />
                : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-3">
            {NAV_GROUPS.map(group => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="text-[9px] uppercase tracking-widest font-semibold text-sidebar-foreground/30 px-3 pb-1">
                    {group.label}
                  </p>
                )}
                {collapsed && <div className="border-t border-sidebar-border/40 my-1.5" />}
                <div className="space-y-0.5">
                  {group.items.map(item => (
                    <NavItemEl
                      key={item.href}
                      {...item}
                      collapsed={collapsed}
                      badge={item.href === "/approval-inbox" ? pendingCount : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className={cn(
            "border-t border-sidebar-border shrink-0",
            collapsed ? "py-3 flex justify-center" : "px-4 py-3"
          )}>
            {!collapsed
              ? <div className="text-sidebar-foreground/40 text-xs">FY 2025-26</div>
              : <div className="text-sidebar-foreground/30 text-[9px] font-semibold">FY26</div>
            }
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b bg-white shrink-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            {/* Notification bell with badge */}
            <div className="relative">
              <button className="relative text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors">
                <Bell className="h-4.5 w-4.5" />
                {pendingCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border border-white leading-none">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Role / user switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-3 border-l hover:opacity-80 transition-opacity">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    ROLE_STYLE[user.role] ?? "bg-primary/10 text-primary"
                  )}>
                    {user.initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-foreground leading-tight">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.roleLabel}</div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.designation}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3" />Switch Role (Demo)
                </DropdownMenuLabel>
                {users.filter(u => u.id !== user.id).map(u => {
                  const uPending = getPendingIndentIdsForRole(u.role).length;
                  return (
                    <DropdownMenuItem key={u.id} onClick={() => switchUser(u.id)} className="cursor-pointer">
                      <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 shrink-0", ROLE_STYLE[u.role] ?? "bg-muted")}>
                        {u.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.roleLabel}</p>
                      </div>
                      {uPending > 0 && (
                        <span className="ml-2 h-5 min-w-5 px-1 flex items-center justify-center bg-red-100 text-red-700 text-[10px] font-bold rounded-full shrink-0">
                          {uPending}
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/login")} className="cursor-pointer text-muted-foreground">
                  <LogOut className="h-3.5 w-3.5 mr-2" />Login Screen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
