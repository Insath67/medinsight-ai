"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import {
  FileText,
  CalendarDays,
  ChevronRight,
  ShieldCheck,
  History,
} from "lucide-react";

type ReportItem = {
  id?: string | number;
  report_id?: string | number;
  file_name?: string;
  filename?: string;
  report_type?: string;
  type?: string;
  uploaded_at?: string;
  created_at?: string;
  status?: string;
};

function ReportHistoryContent() {
  const router = useRouter();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token =
          window.localStorage.getItem("access_token") ||
          window.localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/reports/my-reports`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail || "Failed to load reports")
          );
        }

        const reportsData = Array.isArray(data)
          ? data
          : data.data || data.reports || data.items || [];

        setReports(Array.isArray(reportsData) ? reportsData : []);
      } catch (error: any) {
        setErrorMessage(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [router]);

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString();
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
                  Secure Report Access
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                  Report History
                </h1>

                <p className="mt-3 max-w-2xl text-sm text-blue-50 md:text-base">
                  View all your uploaded medical reports in one place.
                </p>
              </div>

              <div className="hidden rounded-3xl bg-white/10 p-5 backdrop-blur-sm md:block">
                <History className="h-14 w-14 text-white" />
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 text-center text-slate-600">
                Loading reports...
              </div>
            ) : errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-700" />
                </div>

                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  No reports found
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Upload your first report to start tracking your medical
                  history.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {reports.map((report) => (
                  <div
                    key={String(report.id || report.report_id)}
                    className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 transition hover:border-blue-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-blue-100 p-3">
                          <FileText className="h-5 w-5 text-blue-700" />
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {report.file_name ||
                              report.filename ||
                              "Unnamed Report"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-600">
                            Type: {report.report_type || report.type || "N/A"}
                          </p>

                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                              Uploaded:{" "}
                              {formatDate(
                                report.uploaded_at || report.created_at
                              )}
                            </span>
                          </div>

                          <div className="mt-3 inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                            {report.status || "Uploaded"}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            `/patient/report-history/${
                              report.id || report.report_id
                            }`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => router.push("/patient/upload-report")}
                className="flex-1 rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
              >
                Upload New Report
              </button>

              <button
                onClick={() => router.push("/patient/dashboard")}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={["patient", "Patient"]}>
      <>
        <AppNavbar />
        <ReportHistoryContent />
      </>
    </ProtectedRoute>
  );
}