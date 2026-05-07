import { Info } from "lucide-react";

export default function UploadTipsCard() {
  const tips = [
    "Upload a clear scanned image or PDF",
    "Make sure all report pages are visible",
    "Select the closest report type",
    "AI analysis will begin after upload",
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-blue-700" />
        <h2 className="text-lg font-semibold text-slate-900">Upload Tips</h2>
      </div>

      <div className="mt-4 space-y-3">
        {tips.map((tip) => (
          <div key={tip} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}