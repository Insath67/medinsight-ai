import { Download, GitCompareArrows, TrendingUp, MessageCircle } from "lucide-react";

export default function AnalysisActionsCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
      <p className="mt-1 text-sm text-slate-500">
        Continue with related report actions
      </p>

      <div className="mt-5 space-y-3">
        <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Download className="h-4 w-4 text-blue-600" />
          Download AI Summary
        </button>

        <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
          <GitCompareArrows className="h-4 w-4 text-slate-700" />
          Compare with Another Report
        </button>

        <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
          <TrendingUp className="h-4 w-4 text-teal-600" />
          View Health Trends
        </button>

        <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
          <MessageCircle className="h-4 w-4 text-violet-600" />
          Request Consultation
        </button>
      </div>
    </div>
  );
}