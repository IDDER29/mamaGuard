import type { ClinicalHistoryItem } from "@/types";

interface ClinicalHistoryProps {
  history: ClinicalHistoryItem[];
}

export default function ClinicalHistory({ history }: ClinicalHistoryProps) {
  return (
    <section 
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex-1"
      aria-labelledby="history-heading"
    >
      <h2 
        id="history-heading"
        className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sky-500 text-base" aria-hidden="true">
          history_edu
        </span>
        Clinical History
      </h2>
      
      <ul className="space-y-3 relative" role="list">
        <div 
          className="absolute left-[5px] top-2 bottom-2 w-px bg-slate-200"
          aria-hidden="true"
        />
        
        {history.map((item) => (
          <li key={item.id} className="pl-5 relative">
            <span 
              className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"
              aria-hidden="true"
            />
            <time className="block text-xs text-slate-400 mb-0.5">
              {item.date}
            </time>
            <span className="block text-sm font-medium text-slate-700">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
