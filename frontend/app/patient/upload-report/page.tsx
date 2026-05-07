"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { UploadCloud, FileText, ShieldCheck } from "lucide-react";

function UploadReportContent() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a report file");
      return;
    }

    if (!reportType) {
      setError("Please select a report type");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("report_file", file);
      formData.append("report_type", reportType);
      formData.append("notes", notes);

      const response = await fetch(`${API_BASE_URL}/reports/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail)
        );
      }

      setSuccess("Report uploaded successfully");

      setTimeout(() => {
        router.push("/patient/report-history");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 px-8 py-8 text-white">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Medical Upload
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                  Upload Medical Report
                </h1>

                <p className="mt-3 max-w-2xl text-sm text-blue-50 md:text-base">
                  Upload your report securely and let MedInsight AI organize it
                  for deeper analysis and tracking.
                </p>
              </div>

              <div className="hidden rounded-3xl bg-white/10 p-5 backdrop-blur-sm md:block">
                <UploadCloud className="h-14 w-14 text-white" />
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={handleUpload} className="space-y-7">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-100 p-3">
                    <FileText className="h-5 w-5 text-blue-700" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Report Details
                    </h2>
                    <p className="text-sm text-slate-600">
                      Add your report file and a few details before uploading.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-semibold text-slate-800">
                      Report File
                    </label>

                    <div className="mt-3 rounded-2xl border-2 border-dashed border-blue-200 bg-white p-6 transition hover:border-blue-400 hover:bg-blue-50/40">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="block w-full text-base text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Supported formats: PDF, PNG, JPG, JPEG
                      </p>

                      {file && (
                        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                          Selected file: {file.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-slate-800">
                      Report Type
                    </label>

                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Select report type</option>
                      <option value="Blood Test">Blood Test</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="MRI">MRI</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="Urine Test">Urine Test</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-slate-800">
                      Notes (Optional)
                    </label>

                    <textarea
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about this report..."
                      className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Uploading..." : "Upload Report"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/patient/dashboard")}
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UploadReportPage() {
  return (
    <ProtectedRoute allowedRoles={["patient", "Patient"]}>
      <>
        <AppNavbar />
        <UploadReportContent />
      </>
    </ProtectedRoute>
  );
}