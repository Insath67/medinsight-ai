export default function ComparisonSummaryCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Comparison Summary
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        AI-generated overview of the most important differences between the two reports
      </p>

      <div className="mt-5 rounded-2xl bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 p-5">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
          AI Insight
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
          Compared to the earlier report, glucose has increased noticeably and
          now falls in the abnormal range. Hemoglobin remains low but shows mild
          improvement. Cholesterol remains stable within the normal range.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            Glucose Increased
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            Hemoglobin Slightly Improved
          </span>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
            Cholesterol Stable
          </span>
        </div>
      </div>
    </div>
  );
}