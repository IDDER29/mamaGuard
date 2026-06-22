"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Activity, Loader2, Plus } from "lucide-react";
import { recordVital, type VitalRow } from "@/app/actions/vitals";
import { VitalsChart } from "@/components/dashboard/VitalsChart";

interface VitalsCardProps {
  patientId: string;
  vitals: VitalRow[];
}

function toNum(v: string): number | undefined {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
}

export function VitalsCard({ patientId, vitals }: VitalsCardProps) {
  const router = useRouter();
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (saving) return;
    const sys = toNum(systolic);
    const dia = toNum(diastolic);
    if (sys === undefined && dia === undefined && !heartRate && !temperature) return;
    setSaving(true);
    const res = await recordVital({
      patientId,
      systolic: sys,
      diastolic: dia,
      heartRate: toNum(heartRate),
      temperature: toNum(temperature),
    });
    setSaving(false);
    if (res.success) {
      setSystolic("");
      setDiastolic("");
      setHeartRate("");
      setTemperature("");
      router.refresh();
    } else {
      alert(res.error || "Failed to record vitals");
    }
  }, [saving, systolic, diastolic, heartRate, temperature, patientId, router]);

  const last = vitals[vitals.length - 1];
  const bpHigh = last && last.systolic != null && last.diastolic != null && (last.systolic >= 140 || last.diastolic >= 90);

  return (
    <section className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Activity className="h-4.5 w-4.5 text-primary" />
        <h2 className="text-sm font-semibold text-slate-800">Vitals / BP</h2>
        {bpHigh && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
            BP {last!.systolic}/{last!.diastolic}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <VitalsChart vitals={vitals} />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            placeholder="Systolic"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
          />
          <input
            type="number"
            inputMode="numeric"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            placeholder="Diastolic"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
          />
          <input
            type="number"
            inputMode="numeric"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="Heart rate"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="Temp °C"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-white text-sm font-medium py-2 hover:bg-primary/90 shadow-glow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Record reading
        </button>
        <p className="text-[11px] text-slate-400">
          BP ≥140/90 flags a pre-eclampsia concern and raises an alert automatically.
        </p>
      </div>
    </section>
  );
}
