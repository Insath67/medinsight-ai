import Link from "next/link";
import { FileText, Eye, Download, Sparkles } from "lucide-react";

type ReportItem = {
  id: number | string;
  name?: string;
  file_name?: string;
  type?: string;
  report_type?: string;
  date?: string;
  uploaded_at?: string;
  created_at?: string;
};

type RecentReportsCardProps = {
  reports: ReportItem[];
  loading?: boolean;
};

export default function RecentReportsCard({
  reports = [],
  loading = false,
}: RecentReportsCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Reports
          </h2>
          <p className="text-sm text-slate-500">
            Quick access to your latest uploaded reports
          </p>
        </div>

        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
            Loading recent reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
            No reports found.
          </div>
        ) : (
          reports.map((report, index) => (
            <div
              key={report.id || index}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-blue-100 p-3">
                  <FileText className="h-5 w-5 text-blue-700" />
                </div>

                <div>
                  <p className="font-medium text-slate-900">
                    {report.file_name || report.name || "Unnamed report"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {report.report_type || report.type || "Medical Report"} •{" "}
                    {report.uploaded_at || report.created_at || report.date || "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-white">
                  <Eye className="h-4 w-4" />
                  View
                </button>

                <Link
                  href="/patient/analysis-details"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-white"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze
                </Link>

                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-white">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}