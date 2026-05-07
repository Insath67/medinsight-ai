export default function KeyFindingsCard() {
  const findings = [
    "High Glucose Level",
    "Mild Low Hemoglobin",
    "Normal Cholesterol",
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Key Findings</h2>
      <p className="mt-1 text-sm text-slate-500">
        Important findings extracted by AI
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
          High Glucose
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          Low Hemoglobin
        </span>
        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
          Normal Cholesterol
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {findings.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 p-4 text-sm font-medium text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}