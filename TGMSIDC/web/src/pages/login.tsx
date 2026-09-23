import { useState } from "react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Building2, Stethoscope, Wallet, Truck, Users, Star } from "lucide-react";

const ROLE_META: Record<UserRole, { icon: React.ElementType; color: string; desc: string }> = {
  indent_initiator: { icon: Stethoscope, color: "bg-blue-100 text-blue-700 border-blue-200", desc: "Create & track procurement indents" },
  biomedical_engineer: { icon: Building2, color: "bg-violet-100 text-violet-700 border-violet-200", desc: "Technical review — Step 2 approval" },
  gm: { icon: ShieldCheck, color: "bg-emerald-100 text-emerald-700 border-emerald-200", desc: "GM approval & procurement mode selection" },
  director: { icon: Star, color: "bg-amber-100 text-amber-700 border-amber-200", desc: "Administrative sanction for high-value items (≥₹5L)" },
  finance: { icon: Wallet, color: "bg-orange-100 text-orange-700 border-orange-200", desc: "Budget, invoices and payments" },
  supplier: { icon: Truck, color: "bg-rose-100 text-rose-700 border-rose-200", desc: "Acknowledge POs, submit invoices" },
  facility_receiver: { icon: Users, color: "bg-teal-100 text-teal-700 border-teal-200", desc: "Record GRN & installation confirmation" },
};

export default function Login() {
  const { users, switchUser } = useAuth();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(218,42%,10%)] to-[hsl(218,42%,20%)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-2">
            <span className="text-white font-bold text-xl">HP</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Health Procurement Portal</h1>
          <p className="text-white/60 text-sm">Medical Services & Infrastructure Development Corporation</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-amber-300 text-xs font-medium">Demo Login — Click a role to enter</span>
          </div>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Select User Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {users.map((u) => {
              const meta = ROLE_META[u.role];
              const Icon = meta.icon;
              const isSelected = selected === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelected(u.id);
                    switchUser(u.id);
                    navigate("/");
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "bg-white/15 border-white/40"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${meta.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm">{u.name}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${meta.color}`}>{u.roleLabel}</Badge>
                    </div>
                    <p className="text-white/50 text-xs mt-0.5">{meta.desc}</p>
                    {u.facility && <p className="text-white/40 text-xs">{u.facility}</p>}
                  </div>
                  <ShieldCheck className="h-4 w-4 text-white/20 shrink-0" />
                </button>
              );
            })}
          </CardContent>
        </Card>

        <p className="text-center text-white/30 text-xs">
          Medical Devices Procurement System
        </p>
      </div>
    </div>
  );
}
