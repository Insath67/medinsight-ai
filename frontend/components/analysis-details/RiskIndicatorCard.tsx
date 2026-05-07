export default function RiskIndicatorCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Overall Risk Level</h2>
      <p className="mt-1 text-sm text-slate-500">
        Quick severity indicator based on AI findings
      </p>

      <div className="mt-5 rounded-2xl bg-amber-50 p-6 text-center">
        <p className="text-sm font-medium text-amber-700">Moderate</p>
        <div className="mt-3 h-3 rounded-full bg-slate-200">
          <div className="h-3 w-2/3 rounded-full bg-amber-500" />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Follow-up is recommended for abnormal findings.
        </p>
      </div>
    </div>
  );
}