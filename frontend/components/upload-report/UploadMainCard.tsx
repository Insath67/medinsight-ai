import { CloudUpload, FileText, X } from "lucide-react";

export default function UploadMainCard() {
  return (
    <div className="min-h-[760px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Upload Report File
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Drag and drop your report, or browse from your device.
        </p>
      </div>

      <div className="mt-6 rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
          <CloudUpload className="h-8 w-8 text-blue-700" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Drag & drop your medical report here
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          or click to browse files from your device
        </p>

        <button className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Browse Files
        </button>

        <p className="mt-4 text-xs text-slate-500">
          Supported: PDF, PNG, JPG, JPEG
        </p>
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium text-slate-700">
          Report Type
        </label>

        <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none">
          <option>Select report type</option>
          <option>Blood Test</option>
          <option>Urine Test</option>
          <option>Liver Function Test</option>
          <option>Kidney Function Test</option>
          <option>Lipid Profile</option>
          <option>Thyroid Test</option>
          <option>Scan / Imaging</option>
          <option>Other</option>
        </select>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-100 p-3">
              <FileText className="h-5 w-5 text-blue-700" />
            </div>

            <div>
              <p className="font-medium text-slate-900">
                blood_test_april.pdf
              </p>
              <p className="mt-1 text-sm text-slate-500">PDF • 1.8 MB</p>
            </div>
          </div>

          <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Upload Report
        </button>

        <button className="rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200">
          Clear
        </button>
      </div>
      
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
  <h3 className="text-sm font-semibold text-slate-900">
    Upload Status Preview
  </h3>

  <p className="mt-2 text-sm leading-6 text-slate-600">
    Once uploaded, your report will be securely stored and prepared for AI
    analysis. You’ll then be able to review findings, compare reports, and
    request consultation if needed.
  </p>

  <div className="mt-4 grid gap-3 sm:grid-cols-3">
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Step 1
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">
        Upload report
      </p>
    </div>

    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Step 2
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">
        AI analysis
      </p>
    </div>

    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Step 3
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">
        View insights
      </p>
    </div>
  </div>
</div>

    </div>
  );
}