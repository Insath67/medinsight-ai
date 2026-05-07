export default function NextStepsCard() {
  const steps = [
    "Book a follow-up consultation with your doctor",
    "Repeat blood glucose testing if recommended",
    "Discuss low hemoglobin and possible dietary changes",
    "Download or compare this report with an earlier one",
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Suggested Next Steps
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Recommended actions based on this report analysis
      </p>

      <div className="mt-5 space-y-3">
        {steps.map((step) => (
          <div
            key={step}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
          >
            • {step}
          </div>
        ))}
      </div>
    </div>
  );
}