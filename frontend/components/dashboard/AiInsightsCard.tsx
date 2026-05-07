export default function AiInsightsCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Latest AI Insight
        </h2>
        <p className="text-sm text-slate-500">
          A quick summary of your most recent AI-generated report analysis
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 p-5">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
          AI Summary
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
          Your latest blood test shows elevated glucose levels and mildly low
          hemoglobin. These findings may suggest a metabolic imbalance and mild
          anemia. A follow-up consultation may be recommended.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            High Glucose
          </span>

          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            Low Hemoglobin
          </span>

          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
            Follow-up Suggested
          </span>
        </div>
      </div>
    </div>
  );
}