interface AIRecommendationProps {
  recommendation: string;
}

export default function AIRecommendation({ recommendation }: AIRecommendationProps) {
  return (
    <aside 
      className="bg-blue-50 rounded-xl p-4 border border-blue-100" 
      aria-labelledby="recommendation-heading"
    >
      <div className="flex gap-3">
        <span className="material-symbols-outlined text-sky-500 mt-0.5 text-lg shrink-0" aria-hidden="true">
          info
        </span>
        <div>
          <h3 id="recommendation-heading" className="text-xs font-bold text-slate-700 uppercase mb-1">
            AI Recommendation
          </h3>
          <p className="text-sm text-slate-600 leading-snug">
            {recommendation}
          </p>
        </div>
      </div>
    </aside>
  );
}
