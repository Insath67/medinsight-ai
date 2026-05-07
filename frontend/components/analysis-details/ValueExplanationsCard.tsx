export default function ValueExplanationsCard() {
  const explanations = [
    {
      title: "Glucose - High",
      desc: "Your glucose level is above the normal range. This may indicate elevated blood sugar levels and should be reviewed with your doctor if it persists.",
      badge: "bg-red-100 text-red-700",
    },
    {
      title: "Hemoglobin - Low",
      desc: "Your hemoglobin is slightly low. This may suggest mild anemia or another underlying issue depending on other symptoms and clinical context.",
      badge: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Lab Value Explanations
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Easy-to-read explanations for flagged values
      </p>

      <div className="mt-5 space-y-4">
        {explanations.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-slate-900">
                {item.title}
              </h3>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.badge}`}>
                Explained
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}