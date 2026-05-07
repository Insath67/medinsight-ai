import { Upload, GitCompareArrows } from "lucide-react";
import Link from "next/link";

export default function DashboardWelcomeHeader() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back 👋
          </h1>

          <p className="text-slate-600 mt-2">
            Manage your reports, AI insights and consultations in one place.
          </p>
        </div>

        <div className="flex gap-3">

          <Link
              href="/patient/upload-report"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
              <Upload size={16} />
              Upload Report
          </Link>

          <Link
              href="/patient/compare-reports"
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
          >
              <GitCompareArrows size={16} />
              Compare
          </Link>

        </div>

      </div>
    </div>
  );
}