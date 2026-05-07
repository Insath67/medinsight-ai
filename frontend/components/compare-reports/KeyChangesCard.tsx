export default function KeyChangesCard() {
  const changes = [
    {
      test: "Glucose",
      change: "+22 mg/dL",
      note: "Moved from borderline to high",
      color: "text-red-600",
    },
    {
      test: "Hemoglobin",
      change: "+1.5 g/dL",
      note: "Improved slightly but still below normal",
      color: "text-amber-600",
    },
    {
      test: "Cholesterol",
      change: "+4 mg/dL",
      note: "No significant change",
      color: "text-teal-600",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Key Changes</h2>
      <p className="mt-1 text-sm text-slate-500">
        Important value changes detected between the two reports
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {changes.map((item) => (
          <div
            key={item.test}
            className="rounded-2xl border border-slate-200 p-5"
          >
            <p className="text-sm font-medium text-slate-500">{item.test}</p>
            <p className={`mt-3 text-2xl font-bold ${item.color}`}>
              {item.change}
            </p>
            <p className="mt-2 text-sm text-slate-500">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}