"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  Activity,
  Brain,
  CalendarDays,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Stethoscope,
  Users,
  Eye,
  AlertCircle,
  MessageSquareText,
} from "lucide-react";

type DoctorInfo = {
  id: string;
  name: string;
  email: string;
};

type DashboardStats = {
  total_patients: number;
  total_reports: number;
  recent_reports_count: number;
};

type RecentReport = {
  id: string;
  patient_id: string;
  patient_name: string;
  file_name: string;
  report_type: string;
  uploaded_at: string;
  status: string;
  notes?: string;
};

type DashboardData = {
  doctor: DoctorInfo;
  stats: DashboardStats;
  recent_reports: RecentReport[];
};

export default function DoctorDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filteredReports, setFilteredReports] = useState<RecentReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDoctorDashboard = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        setErrorMessage("Login token not found. Please login again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/doctors/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Failed to load doctor dashboard data."
        );
      }

      const data: DashboardData = await response.json();
      setDashboardData(data);
      setFilteredReports(data.recent_reports || []);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboard();
  }, []);

  useEffect(() => {
    if (!dashboardData?.recent_reports) return;

    const term = searchTerm.toLowerCase();

    const filtered = dashboardData.recent_reports.filter((report) => {
      return (
        report.patient_name.toLowerCase().includes(term) ||
        report.file_name.toLowerCase().includes(term) ||
        report.report_type.toLowerCase().includes(term) ||
        report.status.toLowerCase().includes(term)
      );
    });

    setFilteredReports(filtered);
  }, [searchTerm, dashboardData]);

  const formatDate = (dateValue: string) => {
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

  return (
    <ProtectedRoute allowedRoles={["Doctor", "doctor"]}>
      <>
        <AppNavbar />

        <main className="min-h-screen bg-slate-50 px-6 py-8">
          <section className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 shadow-xl">
              <div className="flex flex-col gap-6 px-8 py-10 text-white md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                    <Stethoscope size={18} />
                    Doctor Workspace
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    Doctor Dashboard
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    View patient reports, AI-powered medical insights, and
                    recent uploaded reports in one secure place.
                  </p>

                  {dashboardData?.doctor && (
                    <p className="mt-4 text-sm text-blue-50">
                      Logged in as{" "}
                      <span className="font-semibold">
                        {dashboardData.doctor.name}
                      </span>{" "}
                      • {dashboardData.doctor.email}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-4 md:items-end">
                  <Link
                    href="/doctor/consultations"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
                  >
                    <MessageSquareText size={18} />
                    Consultation Requests
                  </Link>

                  <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur">
                    <Brain size={58} />
                  </div>
                </div>
              </div>
            </div>

            {loading && (
              <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="font-medium">
                    Loading doctor dashboard...
                  </span>
                </div>
              </div>
            )}

            {!loading && errorMessage && (
              <div className="mt-8 rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} />
                  <div>
                    <h2 className="font-semibold">Unable to load dashboard</h2>
                    <p className="mt-1 text-sm">{errorMessage}</p>

                    <button
                      onClick={fetchDoctorDashboard}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !errorMessage && dashboardData && (
              <>
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Total Patients
                        </p>
                        <h2 className="mt-2 text-4xl font-bold text-slate-900">
                          {dashboardData.stats.total_patients}
                        </h2>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <Users size={28} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Total Reports
                        </p>
                        <h2 className="mt-2 text-4xl font-bold text-slate-900">
                          {dashboardData.stats.total_reports}
                        </h2>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                        <FileText size={28} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Recent Reports
                        </p>
                        <h2 className="mt-2 text-4xl font-bold text-slate-900">
                          {dashboardData.stats.recent_reports_count}
                        </h2>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                        <Activity size={28} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Recent Patient Reports
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Latest uploaded medical reports from patients.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search reports..."
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white md:w-72"
                        />
                      </div>

                      <button
                        onClick={fetchDoctorDashboard}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        <RefreshCw size={16} />
                        Refresh
                      </button>
                    </div>
                  </div>

                  {filteredReports.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <FileText className="mx-auto text-slate-400" size={36} />
                      <h3 className="mt-3 font-semibold text-slate-800">
                        No reports found
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Recent reports will appear here once patients upload
                        them.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse text-left">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                                Patient
                              </th>
                              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                                Report
                              </th>
                              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                                Type
                              </th>
                              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                                Uploaded
                              </th>
                              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                                Status
                              </th>
                              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredReports.map((report) => (
                              <tr
                                key={report.id}
                                className="transition hover:bg-slate-50"
                              >
                                <td className="px-5 py-4">
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {report.patient_name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      ID: {report.patient_id.slice(0, 8)}...
                                    </p>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                      <FileText size={20} />
                                    </div>
                                    <p className="max-w-[280px] truncate font-medium text-slate-800">
                                      {report.file_name}
                                    </p>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                                    {report.report_type}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <CalendarDays size={16} />
                                    {formatDate(report.uploaded_at)}
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                    {report.status}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <Link
                                    href={`/doctor/reports/${report.id}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                  >
                                    <Eye size={16} />
                                    View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}