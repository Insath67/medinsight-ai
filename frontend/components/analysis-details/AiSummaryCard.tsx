export default function AiSummaryCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">AI Summary</h2>
      <p className="mt-1 text-sm text-slate-500">
        Quick explanation of the most recent analyzed report
      </p>

      <div className="mt-5 rounded-2xl bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 p-5">
        <p className="text-sm leading-7 text-slate-700 sm:text-base">
          Your blood test shows elevated glucose and mildly low hemoglobin.
          These findings may suggest possible metabolic imbalance and mild
          anemia. A follow-up consultation and repeat blood work may be
          recommended depending on your symptoms and medical history.
        </p>
      </div>
    </div>
  );
}