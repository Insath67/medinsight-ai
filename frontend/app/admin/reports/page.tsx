"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  CalendarDays,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

type AdminReport = {
  id?: string;
  patient_id?: string;
  patient_name?: string;
  patient_email?: string;
  file_name?: string;
  stored_file_name?: string;
  file_path?: string;
  report_type?: string;
  uploaded_at?: string;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getAuthHeaders = () => {
    const token = getToken();

    if (!token) {
      throw new Error("Login token not found. Please login again.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const normalizeList = (data: any): AdminReport[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.reports)) return data.reports;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to load reports.");
      }

      setReports(normalizeList(data));
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return reports;

    return reports.filter((report) => {
      return (
        String(report.file_name || "").toLowerCase().includes(keyword) ||
        String(report.report_type || "").toLowerCase().includes(keyword) ||
        String(report.patient_name || "").toLowerCase().includes(keyword) ||
        String(report.patient_email || "").toLowerCase().includes(keyword)
      );
    });
  }, [reports, searchTerm]);

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const deleteReport = async (report: AdminReport) => {
    const reportId = String(report.id || "");

    if (!reportId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this report?\n\n${report.file_name || "Medical Report"}`
    );

    if (!confirmed) return;

    try {
      setDeletingId(reportId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to delete report.");
      }

      setSuccessMessage("Report deleted successfully.");
      await fetchReports();
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "Admin"]}>
      <>
        <AppNavbar />

        <main className="min-h-screen bg-slate-50 px-6 py-8">
          <section className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-violet-700 via-blue-700 to-cyan-500 shadow-xl">
              <div className="flex flex-col gap-6 px-8 py-10 text-white md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                    <ShieldCheck size={18} />
                    Admin Report Control
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    Report Management
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    View uploaded patient reports and remove mistaken, duplicate,
                    or unwanted documents when needed.
                  </p>
                </div>

                <div className="rounded-[28px] bg-white/15 px-8 py-6 text-center backdrop-blur">
                  <p className="text-sm text-blue-50">Total Reports</p>
                  <p className="mt-2 text-4xl font-bold">{reports.length}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Uploaded Reports
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Admin can remove incorrect uploads. Deletions are logged and
                    patients are notified.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search reports..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white sm:w-80"
                    />
                  </div>

                  <button
                    onClick={fetchReports}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>

              {successMessage && (
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  <AlertCircle size={18} />
                  {errorMessage}
                </div>
              )}

              {loading && (
                <div className="flex min-h-[280px] items-center justify-center">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-semibold">Loading reports...</span>
                  </div>
                </div>
              )}

              {!loading && !errorMessage && filteredReports.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <FileText className="mx-auto text-slate-400" size={44} />
                  <h3 className="mt-4 text-lg font-bold text-slate-800">
                    No reports found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Uploaded patient reports will appear here.
                  </p>
                </div>
              )}

              {!loading && filteredReports.length > 0 && (
                <div className="space-y-4">
                  {filteredReports.map((report) => {
                    const reportId = String(report.id || "");
                    const isDeleting = deletingId === reportId;

                    return (
                      <div
                        key={reportId}
                        className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5 transition hover:border-blue-200 hover:bg-white"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                              <FileText size={30} />
                            </div>

                            <div>
                              <h3 className="text-xl font-bold text-slate-950">
                                {report.file_name || "Medical Report"}
                              </h3>

                              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                                <span className="inline-flex items-center gap-2">
                                  <UserRound size={16} />
                                  {report.patient_name || "Unknown Patient"}
                                </span>

                                <span className="inline-flex items-center gap-2">
                                  <CalendarDays size={16} />
                                  {formatDate(report.uploaded_at)}
                                </span>

                                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                                  {report.report_type || "No Type"}
                                </span>
                              </div>

                              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                                <p className="rounded-2xl bg-white px-4 py-3">
                                  <span className="font-bold text-slate-800">
                                    Patient Email:
                                  </span>{" "}
                                  {report.patient_email || "N/A"}
                                </p>

                                <p className="rounded-2xl bg-white px-4 py-3">
                                  <span className="font-bold text-slate-800">
                                    Stored File:
                                  </span>{" "}
                                  {report.stored_file_name || "N/A"}
                                </p>
                              </div>

                              <p className="mt-3 max-w-4xl rounded-2xl bg-white px-4 py-3 text-xs text-slate-500">
                                Report ID: {reportId}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteReport(report)}
                            disabled={isDeleting}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeleting ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}