"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Loader2, Save, ShieldCheck } from "lucide-react";
import { getCurrentProfile, updateMyProfile, type ClinicianProfile } from "@/app/actions/profiles";
import { ROLE_LABELS } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";

const LANGS = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ClinicianProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [uiLanguage, setUiLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const p = await getCurrentProfile();
      if (!active) return;
      setProfile(p);
      setFullName(p.full_name ?? "");
      setRegion(p.region ?? "");
      setUiLanguage(p.ui_language ?? "en");
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const isDemo = profile?.id === "demo";

  const handleSave = async () => {
    setSaving(true);
    const res = await updateMyProfile({
      full_name: fullName.trim() || null,
      region: region.trim() || null,
      ui_language: uiLanguage,
    });
    setSaving(false);
    if (res.success) toast({ title: "Saved", description: "Your profile was updated." });
    else toast({ title: "Couldn't save", description: res.error, variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-1">
          <SettingsIcon className="h-7 w-7 text-primary" /> Settings
        </h1>
        <p className="text-sm text-slate-600 mb-6">Your clinician profile and preferences.</p>

        {loading ? (
          <div className="h-64 rounded-2xl bg-white ring-1 ring-slate-200/70 animate-pulse" />
        ) : (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm text-slate-600">Role</span>
              <span className="ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {profile ? ROLE_LABELS[profile.role] : "—"}
              </span>
            </div>

            {isDemo && (
              <p className="text-xs text-amber-700 bg-amber-50 ring-1 ring-amber-100 rounded-lg px-3 py-2">
                Demo mode — sign in to edit your profile. Showing administrator access.
              </p>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isDemo}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Region</label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={isDemo}
                placeholder="e.g. Rabat-Salé-Kénitra"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dashboard language</label>
              <select
                value={uiLanguage}
                onChange={(e) => setUiLanguage(e.target.value)}
                disabled={isDemo}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-primary/50 disabled:bg-slate-50"
              >
                {LANGS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Preference is saved now; full dashboard translation ships in Plan E3.4.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isDemo}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-white text-sm font-medium py-2 hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
