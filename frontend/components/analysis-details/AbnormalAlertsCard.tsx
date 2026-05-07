export default function AbnormalAlertsCard() {
  const alerts = [
    {
      title: "High Glucose",
      level: "Moderate",
      note: "Above normal range and may require follow-up.",
      badge: "bg-red-100 text-red-700",
    },
    {
      title: "Low Hemoglobin",
      level: "Mild",
      note: "Slightly below normal and may suggest mild anemia.",
      badge: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Abnormal Alerts
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Important flagged findings from this analysis
      </p>

      <div className="mt-5 space-y-4">
        {alerts.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${item.badge}`}
              >
                {item.level}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {item.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}