export default function LabResultsCard() {
  const rows = [
    {
      test: "Glucose",
      value: "140 mg/dL",
      range: "70 - 110 mg/dL",
      status: "High",
      badge: "bg-red-100 text-red-700",
    },
    {
      test: "Hemoglobin",
      value: "11 g/dL",
      range: "13 - 17 g/dL",
      status: "Low",
      badge: "bg-amber-100 text-amber-700",
    },
    {
      test: "Cholesterol",
      value: "180 mg/dL",
      range: "< 200 mg/dL",
      status: "Normal",
      badge: "bg-teal-100 text-teal-700",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Lab Results</h2>
      <p className="mt-1 text-sm text-slate-500">
        Extracted test values with status
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th className="text-left text-sm font-medium text-slate-500">
                Test Name
              </th>
              <th className="text-left text-sm font-medium text-slate-500">
                Result
              </th>
              <th className="text-left text-sm font-medium text-slate-500">
                Normal Range
              </th>
              <th className="text-left text-sm font-medium text-slate-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.test} className="rounded-2xl bg-slate-50">
                <td className="rounded-l-2xl px-4 py-4 text-sm font-medium text-slate-900">
                  {row.test}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">{row.value}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{row.range}</td>
                <td className="rounded-r-2xl px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${row.badge}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}