"use client";

// Plan E4.3 — MamaGuard admin console: staff & roles, facility directory, audit log.

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  Building2,
  ScrollText,
  Trash2,
  Plus,
  Lock,
} from "lucide-react";
import {
  getCurrentProfile,
  listStaff,
  setRole,
  type ClinicianProfile,
} from "@/app/actions/profiles";
import {
  listFacilities,
  createFacility,
  deleteFacility,
  type FacilityRow,
} from "@/app/actions/referrals";
import { listAuditLog, type AuditRow } from "@/app/actions/audit";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";

const ROLE_OPTIONS = Object.keys(ROLE_LABELS) as Role[];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminConsolePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [staff, setStaff] = useState<ClinicianProfile[]>([]);
  const [facilities, setFacilities] = useState<FacilityRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);

  // Inline add-facility form state.
  const [fName, setFName] = useState("");
  const [fType, setFType] = useState("");
  const [fRegion, setFRegion] = useState("");
  const [fCity, setFCity] = useState("");
  const [fPhone, setFPhone] = useState("");

  const [busy, setBusy] = useState(false);

  // Reload staff + facilities + audit (admin-gated already checked).
  const refresh = useCallback(async () => {
    const [staffRows, facilityRows, auditRows] = await Promise.all([
      listStaff(),
      listFacilities(),
      listAuditLog(100),
    ]);
    setStaff(staffRows);
    setFacilities(facilityRows);
    setAudit(auditRows);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await getCurrentProfile();
      if (!active) return;
      if (me.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const [staffRows, facilityRows, auditRows] = await Promise.all([
        listStaff(),
        listFacilities(),
        listAuditLog(100),
      ]);
      if (!active) return;
      setIsAdmin(true);
      setStaff(staffRows);
      setFacilities(facilityRows);
      setAudit(auditRows);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const onSetRole = async (profileId: string, role: Role) => {
    setBusy(true);
    const res = await setRole(profileId, role);
    setBusy(false);
    if (!res.success) {
      toast({ title: "Failed", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Role updated", description: `Set to ${ROLE_LABELS[role]}.` });
    await refresh();
  };

  const onCreateFacility = async () => {
    const name = fName.trim();
    if (!name) {
      toast({ title: "Name required", description: "Enter a facility name.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const res = await createFacility({
      name,
      type: fType.trim() || undefined,
      region: fRegion.trim() || undefined,
      city: fCity.trim() || undefined,
      phone: fPhone.trim() || undefined,
    });
    setBusy(false);
    if (!res.success) {
      toast({ title: "Failed", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Facility added", description: name });
    setFName("");
    setFType("");
    setFRegion("");
    setFCity("");
    setFPhone("");
    await refresh();
  };

  const onDeleteFacility = async (f: FacilityRow) => {
    if (!window.confirm(`Delete facility "${f.name}"? This cannot be undone.`)) return;
    setBusy(true);
    const res = await deleteFacility(f.id);
    setBusy(false);
    if (!res.success) {
      toast({ title: "Failed", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Facility deleted", description: f.name });
    await refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-[1100px]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Admin Console
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage staff roles, the facility directory, and review the audit trail.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white ring-1 ring-slate-200/70 animate-pulse" />
            ))}
          </div>
        ) : !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Administrators only</h3>
            <p className="text-sm text-slate-600">
              You do not have permission to view the admin console.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Staff & roles */}
            <section className="rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-slate-900">Staff &amp; roles</h2>
                <span className="ml-auto text-xs text-slate-400">{staff.length} member(s)</span>
              </div>
              {staff.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-500">No staff profiles yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {staff.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate">{s.full_name || "—"}</p>
                        <p className="text-xs text-slate-500">{ROLE_LABELS[s.role] ?? s.role}</p>
                      </div>
                      <select
                        value={s.role}
                        disabled={busy}
                        onChange={(e) => onSetRole(s.id, e.target.value as Role)}
                        className="text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Facilities */}
            <section className="rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-slate-900">Facilities</h2>
                <span className="ml-auto text-xs text-slate-400">{facilities.length} facility(ies)</span>
              </div>

              {/* Add facility form */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="grid gap-2 sm:grid-cols-5">
                  <input
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    placeholder="Name *"
                    className="text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={fType}
                    onChange={(e) => setFType(e.target.value)}
                    placeholder="Type"
                    className="text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={fCity}
                    onChange={(e) => setFCity(e.target.value)}
                    placeholder="City"
                    className="text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={fRegion}
                    onChange={(e) => setFRegion(e.target.value)}
                    placeholder="Region"
                    className="text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={fPhone}
                    onChange={(e) => setFPhone(e.target.value)}
                    placeholder="Phone"
                    className="text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <button
                  onClick={onCreateFacility}
                  disabled={busy}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Add facility
                </button>
              </div>

              {facilities.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-500">No facilities in the directory yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {facilities.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-slate-900 truncate">{f.name}</p>
                          {f.type && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {f.type}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {[f.city, f.region].filter(Boolean).join(", ") || "—"}
                          {f.phone ? ` · ${f.phone}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteFacility(f)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Audit log */}
            <section className="rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <ScrollText className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-slate-900">Audit log</h2>
                <span className="ml-auto text-xs text-slate-400">{audit.length} entry(ies)</span>
              </div>
              {audit.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-500">No audit entries recorded yet.</p>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-100">
                        <th className="px-5 py-2.5 font-semibold">Time</th>
                        <th className="px-5 py-2.5 font-semibold">Action</th>
                        <th className="px-5 py-2.5 font-semibold">Entity</th>
                        <th className="px-5 py-2.5 font-semibold">Actor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {audit.map((row) => (
                        <tr key={row.id} className="text-slate-700">
                          <td className="px-5 py-2.5 whitespace-nowrap text-slate-500">
                            {formatTimestamp(row.created_at)}
                          </td>
                          <td className="px-5 py-2.5 font-medium text-slate-900">{row.action}</td>
                          <td className="px-5 py-2.5 text-slate-600">{row.entity_type || "—"}</td>
                          <td className="px-5 py-2.5 text-slate-600 truncate max-w-[200px]">
                            {row.actor || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
