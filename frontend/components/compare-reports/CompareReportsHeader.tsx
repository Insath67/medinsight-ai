import { GitCompareArrows, ArrowLeft } from "lucide-react";

export default function CompareReportsHeader() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <GitCompareArrows className="h-4 w-4" />
            Advanced comparison
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Compare Medical Reports
          </h1>

          <p className="mt-2 text-slate-600">
            Compare two reports side by side to identify important health
            changes, trends, and AI-generated insights.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}