"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Ambulance, Loader2, Plus } from "lucide-react";
import {
  createReferral,
  updateReferralStatus,
  type ReferralRow,
  type FacilityRow,
} from "@/app/actions/referrals";

const STATUSES: ReferralRow["status"][] = [
  "created",
  "en_route",
  "arrived",
  "completed",
  "cancelled",
];

const STATUS_STYLE: Record<ReferralRow["status"], string> = {
  created: "bg-sky-50 text-sky-700",
  en_route: "bg-amber-50 text-amber-700",
  arrived: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-500",
};

interface ReferralsCardProps {
  patientId: string;
  referrals: ReferralRow[];
  facilities: FacilityRow[];
}

export function ReferralsCard({ patientId, referrals, facilities }: ReferralsCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [facilityId, setFacilityId] = useState("");
  const [reason, setReason] = useState("");
  const [transportNote, setTransportNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const facilityName = useCallback(
    (id: string | null) => facilities.find((f) => f.id === id)?.name ?? null,
    [facilities],
  );

  const handleCreate = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const res = await createReferral({
      patientId,
      facilityId: facilityId || null,
      reason: reason.trim() || undefined,
      transportNote: transportNote.trim() || undefined,
    });
    setSaving(false);
    if (res.success) {
      setFacilityId("");
      setReason("");
      setTransportNote("");
      setOpen(false);
      router.refresh();
    } else {
      alert(res.error || "Failed to create referral");
    }
  }, [saving, patientId, facilityId, reason, transportNote, router]);

  const handleStatus = useCallback(
    async (id: string, status: ReferralRow["status"]) => {
      setBusyId(id);
      const res = await updateReferralStatus(id, status);
      setBusyId(null);
      if (res.success) router.refresh();
      else alert(res.error || "Failed to update referral");
    },
    [router],
  );

  return (
    <section className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Ambulance className="h-4.5 w-4.5 text-primary" />
        <h2 className="text-sm font-semibold text-slate-800">Referrals</h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/10"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </div>
      <div className="p-4 space-y-3">
        {referrals.length === 0 ? (
          <p className="text-xs text-slate-500">No referrals.</p>
        ) : (
          <ul className="space-y-2">
            {referrals.map((r) => (
              <li key={r.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900 truncate">
                    {facilityName(r.facility_id) || "Unassigned facility"}
                  </span>
                  <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLE[r.status]}`}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>
                {r.reason && <p className="text-xs text-slate-500 mt-0.5 truncate">{r.reason}</p>}
                <select
                  value={r.status}
                  disabled={busyId === r.id}
                  onChange={(e) => handleStatus(r.id, e.target.value as ReferralRow["status"])}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs bg-white outline-none focus:border-primary/50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}

        {open && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-primary/50"
            >
              <option value="">Select facility…</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.city ? ` — ${f.city}` : ""}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (e.g. severe pre-eclampsia)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
            <input
              type="text"
              value={transportNote}
              onChange={(e) => setTransportNote(e.target.value)}
              placeholder="Transport note (optional)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-white text-sm font-medium py-2 hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ambulance className="h-4 w-4" />}
              Create referral
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
