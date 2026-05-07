"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  GitCompareArrows,
  ShieldCheck,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
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
};

type CompareSummary = {
  total_compared_tests?: number;
  improved_count?: number;
  worsened_count?: number;
  unchanged_count?: number;
  normalized_count?: number;
  newly_abnormal_count?: number;
};

type CompareItem = {
  test_name?: string;
  normalized_test_name?: string;
  old_value?: string | number;
  new_value?: string | number;
  difference?: number | null;
  trend?: string;
  old_status?: string;
  new_status?: string;
  status_change?: string;
};

type ClinicalInterpretation = {
  test_name?: string;
  interpretation?: string;
  recommended_action?: string;
};

type ClinicalSummary = {
  normalized_count?: number;
  worsened_count?: number;
  still_abnormal_count?: number;
  newly_abnormal_count?: number;
  overall_interpretation?: string;
};

type CompareResult = {
  old_report_id?: string;
  new_report_id?: string;
  summary?: CompareSummary;
  comparisons?: CompareItem[];
  clinical_interpretations?: ClinicalInterpretation[];
  clinical_summary?: ClinicalSummary;
};

function CompareReportsContent() {
  const router = useRouter();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [oldReportId, setOldReportId] = useState("");
  const [newReportId, setNewReportId] = useState("");
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoadingReports(true);
        setErrorMessage("");

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/reports/my-reports`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load reports");
        }

        const reportsData = Array.isArray(data)
          ? data
          : data.data || data.reports || data.items || [];

        setReports(Array.isArray(reportsData) ? reportsData : []);
      } catch (error: any) {
        setErrorMessage(error.message || "Failed to load reports");
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [router]);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setCompareResult(null);

    if (!oldReportId || !newReportId) {
      setErrorMessage("Please select both reports");
      return;
    }

    if (oldReportId === newReportId) {
      setErrorMessage("Please select two different reports");
      return;
    }

    try {
      setComparing(true);

      const token =
        window.localStorage.getItem("access_token") ||
        window.localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/reports/compare/${oldReportId}/${newReportId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail || "Comparison failed")
        );
      }

      setCompareResult(data);
    } catch (error: any) {
      setErrorMessage(error.message || "Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  const getReportId = (report: ReportItem) =>
    String(report.id || report.report_id || "");

  const getReportName = (report: ReportItem) =>
    report.file_name || report.filename || "Unnamed Report";

  const getTrendBadge = (trend?: string) => {
    const normalized = String(trend || "").toUpperCase();

    if (normalized === "INCREASED") {
      return {
        label: "Increased",
        className: "bg-red-50 text-red-700 border border-red-200",
        icon: <TrendingUp className="h-4 w-4" />,
      };
    }

    if (normalized === "DECREASED") {
      return {
        label: "Decreased",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: <TrendingDown className="h-4 w-4" />,
      };
    }

    return {
      label: "Unchanged",
      className: "bg-slate-100 text-slate-700 border border-slate-200",
      icon: <Activity className="h-4 w-4" />,
    };
  };

  const getStatusChangeBadge = (statusChange?: string) => {
    const normalized = String(statusChange || "").toUpperCase();

    if (normalized === "NORMALIZED") {
      return {
        label: "Normalized",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      };
    }

    if (normalized === "BECAME_ABNORMAL") {
      return {
        label: "Became Abnormal",
        className: "bg-red-50 text-red-700 border border-red-200",
      };
    }

    if (normalized === "STATUS_CHANGED") {
      return {
        label: "Status Changed",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
      };
    }

    return {
      label: "Unchanged",
      className: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  };

  const formatDifference = (difference?: number | null) => {
    if (difference === null || difference === undefined) return "N/A";
    if (difference > 0) return `+${difference}`;
    return String(difference);
  };

  const summary = compareResult?.summary;
  const comparisons = compareResult?.comparisons || [];
  const clinicalInterpretations = compareResult?.clinical_interpretations || [];
  const clinicalSummary = compareResult?.clinical_summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 px-8 py-8 text-white">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" />
                  Smart Report Comparison
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                  Compare Reports
                </h1>

                <p className="mt-3 max-w-2xl text-sm text-blue-50 md:text-base">
                  Compare two medical reports and review changes clearly.
                </p>
              </div>

              <div className="hidden rounded-3xl bg-white/10 p-5 backdrop-blur-sm md:block">
                <GitCompareArrows className="h-14 w-14 text-white" />
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {loadingReports ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 text-center text-slate-600">
                Loading reports...
              </div>
            ) : (
              <form onSubmit={handleCompare} className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-100 p-3">
                      <FileText className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Select Reports
                      </h2>
                      <p className="text-sm text-slate-600">
                        Choose the old and new reports for comparison.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-base font-semibold text-slate-800">
                        Old Report
                      </label>
                      <select
                        value={oldReportId}
                        onChange={(e) => setOldReportId(e.target.value)}
                        className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Select old report</option>
                        {reports.map((report) => (
                          <option
                            key={getReportId(report)}
                            value={getReportId(report)}
                          >
                            {getReportName(report)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-slate-800">
                        New Report
                      </label>
                      <select
                        value={newReportId}
                        onChange={(e) => setNewReportId(e.target.value)}
                        className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Select new report</option>
                        {reports.map((report) => (
                          <option
                            key={getReportId(report)}
                            value={getReportId(report)}
                          >
                            {getReportName(report)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="submit"
                    disabled={comparing}
                    className="flex-1 rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {comparing ? "Comparing..." : "Compare Reports"}
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
            )}

            {compareResult && (
              <div className="mt-10 space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Comparison Result
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Review the medical comparison insights below.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Compared Tests</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {summary?.total_compared_tests ?? 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                    <p className="text-sm text-emerald-700">Improved</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-800">
                      {summary?.improved_count ?? 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
                    <p className="text-sm text-red-700">Worsened</p>
                    <p className="mt-2 text-3xl font-bold text-red-800">
                      {summary?.worsened_count ?? 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm text-slate-700">Unchanged</p>
                    <p className="mt-2 text-3xl font-bold text-slate-800">
                      {summary?.unchanged_count ?? 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
                    <p className="text-sm text-cyan-700">Normalized</p>
                    <p className="mt-2 text-3xl font-bold text-cyan-800">
                      {summary?.normalized_count ?? 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                    <p className="text-sm text-amber-700">Newly Abnormal</p>
                    <p className="mt-2 text-3xl font-bold text-amber-800">
                      {summary?.newly_abnormal_count ?? 0}
                    </p>
                  </div>
                </div>

                {comparisons.length > 0 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h4 className="text-xl font-semibold text-slate-900">
                      Test-by-Test Comparison
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      Detailed comparison for each matched lab marker.
                    </p>

                    <div className="mt-6 space-y-4">
                      {comparisons.map((item, index) => {
                        const trendBadge = getTrendBadge(item.trend);
                        const statusBadge = getStatusChangeBadge(
                          item.status_change
                        );

                        return (
                          <div
                            key={`${item.test_name}-${index}`}
                            className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <h5 className="text-lg font-semibold text-slate-900">
                                  {item.test_name || "Unknown Test"}
                                </h5>
                                <p className="mt-1 text-sm text-slate-500">
                                  Normalized as:{" "}
                                  {item.normalized_test_name || "N/A"}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <div
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${trendBadge.className}`}
                                >
                                  {trendBadge.icon}
                                  {trendBadge.label}
                                </div>

                                <div
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}`}
                                >
                                  {statusBadge.label}
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-4">
                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Old Value
                                </p>
                                <p className="mt-2 text-xl font-bold text-slate-900">
                                  {item.old_value ?? "N/A"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  New Value
                                </p>
                                <p className="mt-2 text-xl font-bold text-slate-900">
                                  {item.new_value ?? "N/A"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Difference
                                </p>
                                <p className="mt-2 text-xl font-bold text-slate-900">
                                  {formatDifference(item.difference)}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Status
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {item.old_status || "N/A"} →{" "}
                                  {item.new_status || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {clinicalInterpretations.length > 0 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-violet-100 p-3">
                        <Stethoscope className="h-5 w-5 text-violet-700" />
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold text-slate-900">
                          Clinical Interpretations
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">
                          AI-supported interpretation and recommended next
                          steps.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {clinicalInterpretations.map((item, index) => (
                        <div
                          key={`${item.test_name}-${index}`}
                          className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                        >
                          <h5 className="text-lg font-semibold text-slate-900">
                            {item.test_name || "Clinical Insight"}
                          </h5>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {item.interpretation ||
                              "No interpretation available."}
                          </p>

                          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 h-4 w-4 text-blue-700" />
                              <p className="text-sm font-medium text-blue-800">
                                {item.recommended_action ||
                                  "No recommendation available."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {clinicalSummary && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-emerald-100 p-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold text-slate-900">
                          Overall Medical Summary
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">
                          Final summary generated from the compared reports.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Normalized
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {clinicalSummary.normalized_count ?? 0}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-red-600">
                          Worsened
                        </p>
                        <p className="mt-2 text-2xl font-bold text-red-800">
                          {clinicalSummary.worsened_count ?? 0}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-amber-600">
                          Still Abnormal
                        </p>
                        <p className="mt-2 text-2xl font-bold text-amber-800">
                          {clinicalSummary.still_abnormal_count ?? 0}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-cyan-600">
                          Newly Abnormal
                        </p>
                        <p className="mt-2 text-2xl font-bold text-cyan-800">
                          {clinicalSummary.newly_abnormal_count ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Overall Interpretation
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        {clinicalSummary.overall_interpretation ||
                          "No overall interpretation available."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompareReportsPage() {
  return (
    <ProtectedRoute allowedRoles={["patient", "Patient"]}>
      <>
        <AppNavbar />
        <CompareReportsContent />
      </>
    </ProtectedRoute>
  );
}