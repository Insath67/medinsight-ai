import { FileCheck } from "lucide-react";

export default function SupportedFilesCard() {
  const files = ["PDF", "PNG", "JPG", "JPEG"];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <FileCheck className="h-5 w-5 text-teal-700" />
        <h2 className="text-lg font-semibold text-slate-900">
          Supported Files
        </h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {files.map((item) => (
          <span
            key={item}
            className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700"
          >
            {item}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Best quality: PDF or clear scan image
      </p>
    </div>
  );
}