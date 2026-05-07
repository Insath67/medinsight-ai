import Link from "next/link";
import { ArrowLeft, Download, GitCompareArrows, FileText } from "lucide-react";

export default function AnalysisDetailsHeader() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <FileText className="h-4 w-4" />
            AI analysis completed
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            blood_test_april.pdf
          </h1>

          <p className="mt-2 text-slate-600">
            Blood Test • Uploaded Apr 06, 2026
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/patient/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <Link
            href="/patient/compare-reports"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
          <GitCompareArrows className="h-4 w-4" />
          Compare
          </Link>

          <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Download Summary
          </button>
        </div>
      </div>
    </div>
  );
}