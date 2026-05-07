export default function ReportInfoCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Report Information</h2>
      <p className="mt-1 text-sm text-slate-500">
        Basic details about this uploaded report
      </p>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Report Name
          </p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            blood_test_april.pdf
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Report Type
          </p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            Blood Test
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Upload Date
          </p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            Apr 06, 2026
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            AI Status
          </p>
          <p className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            Completed
          </p>
        </div>
      </div>
    </div>
  );
}