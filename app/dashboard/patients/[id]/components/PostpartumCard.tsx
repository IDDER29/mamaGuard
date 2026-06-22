"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Baby, Loader2, Save } from "lucide-react";
import { setPostpartumStatus } from "@/app/actions/patients";

interface PostpartumCardProps {
  patientId: string;
  postpartum: boolean;
  deliveryDate: string | null;
}

export function PostpartumCard({ patientId, postpartum, deliveryDate }: PostpartumCardProps) {
  const router = useRouter();
  const [isPostpartum, setIsPostpartum] = useState(postpartum);
  const [date, setDate] = useState(deliveryDate ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const res = await setPostpartumStatus(patientId, {
      postpartum: isPostpartum,
      delivery_date: date.trim() || null,
    });
    setSaving(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Failed to update postpartum status");
    }
  }, [saving, patientId, isPostpartum, date, router]);

  return (
    <section className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Baby className="h-4.5 w-4.5 text-primary" />
        <h2 className="text-sm font-semibold text-slate-800">Postpartum</h2>
        {isPostpartum && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
            Active
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPostpartum}
            onChange={(e) => setIsPostpartum(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
          />
          <span className="text-xs text-slate-600 leading-snug">
            Patient has delivered — switch triage &amp; guidance to{" "}
            <span className="font-semibold text-slate-800">postpartum</span> mode.
          </span>
        </label>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Delivery date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save status
        </button>
      </div>
    </section>
  );
}
