import type { VitalSign } from "@/types";

interface VitalsCardProps {
  vitals: VitalSign[];
}

export default function VitalsCard({ vitals }: VitalsCardProps) {
  const getStatusStyles = (status: VitalSign["status"]) => {
    switch (status) {
      case "critical":
        return "p-3 bg-red-50 rounded-lg border border-red-100";
      case "warning":
        return "p-3 bg-amber-50 rounded-lg border border-amber-100";
      default:
        return "";
    }
  };

  const getStatusColor = (status: VitalSign["status"]) => {
    switch (status) {
      case "critical":
        return "text-red-500";
      case "warning":
        return "text-amber-500";
      default:
        return "text-emerald-500";
    }
  };

  return (
    <section 
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
      aria-labelledby="vitals-heading"
    >
      <h2 
        id="vitals-heading"
        className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sky-500 text-base" aria-hidden="true">
          monitor_heart
        </span>
        Vitals
      </h2>
      
      <div className="space-y-5">
        {vitals.map((vital, index) => (
          <div key={index} className={getStatusStyles(vital.status)}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium text-slate-500 uppercase">
                {vital.label}
              </span>
              {vital.trend && (
                <div className="flex items-center gap-1">
                  <span 
                    className={`material-symbols-outlined text-sm ${getStatusColor(vital.status)}`}
                    aria-hidden="true"
                  >
                    {vital.trend === "up" ? "arrow_upward" : 
                     vital.trend === "down" ? "arrow_downward" : "check"}
                  </span>
                  {vital.trendValue && (
                    <span className="text-xs font-medium text-sky-500">
                      {vital.trendValue}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${
                vital.status === "critical" ? "text-red-500" : "text-slate-800"
              }`}>
                {vital.value}
              </span>
              <span className="text-xs text-slate-500">{vital.unit}</span>
            </div>
            
            {vital.note && (
              <p className={`text-xs mt-1 font-medium ${
                vital.status === "critical" ? "text-red-500" : "text-slate-400"
              }`}>
                {vital.note}
              </p>
            )}
            
            {vital.progress !== undefined && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-sky-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${vital.progress}%` }}
                  role="progressbar"
                  aria-valuenow={vital.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${vital.label} progress`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
