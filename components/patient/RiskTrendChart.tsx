import type { RiskTrendData } from "@/types";

interface RiskTrendChartProps {
  data: RiskTrendData[];
}

export default function RiskTrendChart({ data }: RiskTrendChartProps) {
  const maxScore = Math.max(...data.map(d => d.riskScore));

  const getBarColor = (score: number) => {
    if (score >= 70) return "bg-red-500/80";
    if (score >= 40) return "bg-sky-500/50";
    return "bg-sky-500/20";
  };

  const getBarShadow = (score: number) => {
    if (score >= 70) return "shadow-[0_0_10px_rgba(239,68,68,0.6)]";
    return "";
  };

  return (
    <section 
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
      aria-labelledby="trend-heading"
    >
      <h2 
        id="trend-heading"
        className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sky-500 text-base" aria-hidden="true">
          trending_up
        </span>
        Risk Trend (14 Days)
      </h2>
      
      <div 
        className="h-48 w-full flex items-end justify-between gap-1 relative px-2"
        role="img"
        aria-label="Risk trend chart showing 14-day progression"
      >
        {/* Grid Lines */}
        <div 
          className="absolute inset-0 border-b border-l border-slate-100 pointer-events-none"
          aria-hidden="true"
        />
        <div 
          className="absolute bottom-12 left-0 right-0 h-px bg-slate-100 border-dashed pointer-events-none"
          aria-hidden="true"
        />
        <div 
          className="absolute bottom-24 left-0 right-0 h-px bg-slate-100 border-dashed pointer-events-none"
          aria-hidden="true"
        />
        
        {/* Bars */}
        {data.map((item, index) => (
          <div
            key={index}
            className={`w-full rounded-t-sm group relative transition-all ${
              getBarColor(item.riskScore)
            } ${getBarShadow(item.riskScore)}`}
            style={{ height: `${(item.riskScore / maxScore) * 100}%` }}
          >
            {/* Tooltip on hover */}
            {item.riskScore >= 80 && (
              <div 
                className={`${
                  index === data.length - 1 || index === data.length - 2
                    ? "absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold"
                    : "opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded transition-opacity"
                }`}
              >
                {item.riskScore}%
              </div>
            )}
            {item.riskScore < 80 && (
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded transition-opacity">
                {item.riskScore}%
              </div>
            )}
            <span className="sr-only">
              {item.date}: {item.riskScore}% risk score
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-2 text-[10px] text-slate-400 uppercase font-medium">
        <span>14 days ago</span>
        <span>Today</span>
      </div>
    </section>
  );
}
