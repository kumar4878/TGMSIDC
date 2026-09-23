import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole =
  | "indent_initiator"
  | "biomedical_engineer"
  | "gm"
  | "director"
  | "finance"
  | "supplier"
  | "facility_receiver";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  facility?: string;
  initials: string;
  designation: string;
}

export const DUMMY_USERS: AuthUser[] = [
  {
    id: "u1",
    name: "Clerk B. Rao",
    role: "indent_initiator",
    roleLabel: "Indent Initiator",
    facility: "Gandhi Hospital",
    initials: "BR",
    designation: "Upper Division Clerk, Gandhi Hospital",
  },
  {
    id: "u2",
    name: "Er. K. Srinivas",
    role: "biomedical_engineer",
    roleLabel: "Biomedical Engineer",
    initials: "KS",
    designation: "Sr. Biomedical Engineer, Equipment Wing",
  },
  {
    id: "u3",
    name: "P. Narayan",
    role: "gm",
    roleLabel: "General Manager",
    initials: "PN",
    designation: "General Manager (Equipment), HPC",
  },
  {
    id: "u7",
    name: "D. Venkatesh",
    role: "director",
    roleLabel: "Additional Director",
    initials: "DV",
    designation: "Additional Director (Procurement), HPC",
  },
  {
    id: "u4",
    name: "S. Lakshmi",
    role: "finance",
    roleLabel: "Finance Officer",
    initials: "SL",
    designation: "Finance Officer, HPC",
  },
  {
    id: "u5",
    name: "Rajesh Kumar",
    role: "supplier",
    roleLabel: "Supplier",
    facility: "BPL Medical Technologies Ltd",
    initials: "RK",
    designation: "Sales Manager, BPL Medical Technologies Ltd",
  },
  {
    id: "u6",
    name: "T. Ramaiah",
    role: "facility_receiver",
    roleLabel: "Facility Receiver",
    facility: "Gandhi Hospital",
    initials: "TR",
    designation: "Store Keeper, Gandhi Hospital",
  },
];

interface AuthContextType {
  user: AuthUser;
  users: AuthUser[];
  switchUser: (userId: string) => void;
  can: (action: string) => boolean;
}

const PERMISSIONS: Record<UserRole, string[]> = {
  indent_initiator: ["indent.create", "indent.view", "grn.create", "grn.view"],
  biomedical_engineer: ["indent.review", "indent.approve_step", "indent.view", "equipment.manage", "consolidation.view"],
  gm: ["indent.approve", "indent.approve_step", "indent.reject", "indent.view", "po.approve", "po.cancel", "po.view", "rc.manage", "tender.manage", "budget.view"],
  director: ["indent.sanction", "indent.approve_step", "indent.view", "po.view", "budget.view"],
  finance: ["budget.manage", "payment.approve", "invoice.review", "budget.view", "payment.view"],
  supplier: ["po.acknowledge", "invoice.submit", "installation.submit", "po.view"],
  facility_receiver: ["grn.create", "grn.view", "installation.confirm"],
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(DUMMY_USERS[2]); // Default: GM

  function switchUser(userId: string) {
    const found = DUMMY_USERS.find((u) => u.id === userId);
    if (found) setUser(found);
  }

  function can(action: string): boolean {
    return PERMISSIONS[user.role]?.includes(action) ?? false;
  }

  return (
    <AuthContext.Provider value={{ user, users: DUMMY_USERS, switchUser, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
