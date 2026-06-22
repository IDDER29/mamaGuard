"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { acceptInvite } from "@/app/actions/invites";
import { ROLE_LABELS } from "@/lib/roles";

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
      <AcceptInvite />
    </Suspense>
  );
}

function AcceptInvite() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<{ status: "loading" | "ok" | "error"; msg?: string }>({
    status: "loading",
  });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        if (active) setState({ status: "error", msg: "Missing invite token." });
        return;
      }
      const res = await acceptInvite(token);
      if (!active) return;
      if (res.success) setState({ status: "ok", msg: ROLE_LABELS[res.role] });
      else setState({ status: "error", msg: res.error });
    })();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm p-8">
        {state.status === "loading" && (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600">Accepting your invite…</p>
          </>
        )}
        {state.status === "ok" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h1 className="text-lg font-semibold text-slate-900 mb-1">You&apos;re in</h1>
            <p className="text-sm text-slate-600 mb-5">Your role: <strong>{state.msg}</strong>.</p>
            <button onClick={() => router.push("/dashboard")} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
              Go to dashboard
            </button>
          </>
        )}
        {state.status === "error" && (
          <>
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h1 className="text-lg font-semibold text-slate-900 mb-1">Couldn&apos;t accept invite</h1>
            <p className="text-sm text-slate-600">{state.msg}</p>
          </>
        )}
      </div>
    </div>
  );
}
