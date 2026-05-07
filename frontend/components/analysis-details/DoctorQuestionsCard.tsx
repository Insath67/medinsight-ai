export default function DoctorQuestionsCard() {
  const questions = [
    "Should I repeat the glucose test soon?",
    "Do I need additional tests for low hemoglobin?",
    "Are there any dietary or lifestyle changes I should follow?",
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Suggested Questions for Your Doctor
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Useful questions you may ask during consultation
      </p>

      <div className="mt-5 space-y-3">
        {questions.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
          >
            • {item}
          </div>
        ))}
      </div>
    </div>
  );
}