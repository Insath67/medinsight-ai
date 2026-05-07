import Link from "next/link";
import { ArrowLeft, FileUp } from "lucide-react";

export default function UploadReportHeader() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <FileUp className="h-4 w-4" />
            Secure upload
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Upload Medical Report
          </h1>

          <p className="mt-2 text-slate-600">
            Securely upload your lab reports, scans, or medical documents to
            generate AI-powered insights.
          </p>
        </div>

        <Link
          href="/patient/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}