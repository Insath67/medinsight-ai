import { FileText, ChevronDown } from "lucide-react";

type CompareSelectionCardProps = {
  title: string;
  fileName: string;
  reportType: string;
  reportDate: string;
};

export default function CompareSelectionCard({
  title,
  fileName,
  reportType,
  reportDate,
}: CompareSelectionCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">
            Select a report to compare
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Change
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="rounded-2xl bg-blue-100 p-3">
          <FileText className="h-5 w-5 text-blue-700" />
        </div>

        <div>
          <p className="font-medium text-slate-900">{fileName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {reportType} • {reportDate}
          </p>
        </div>
      </div>
    </div>
  );
}