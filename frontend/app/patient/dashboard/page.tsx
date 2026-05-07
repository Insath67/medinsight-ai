"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
  History,
  Loader2,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
} from "lucide-react";

type ReportItem = {
  id?: string;
  report_id?: string;
  file_name?: string;
  filename?: string;
  report_type?: string;
  type?: string;
  uploaded_at?: string;
  created_at?: string;
};

type ConsultationItem = {
  id?: string;
  doctor_name?: string;
  patient_message?: string;
  report_name?: string;
  status?: string;
  created_at?: string;
};

type ReminderItem = {
  id?: string;
  title?: string;
  message?: string;
  due_date?: string;
  reminder_date?: string;
  status?: string;
};

export default function PatientDashboardPage() {
  const user = getUser();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  const normalizeList = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.reports)) return data.reports;
    if (Array.isArray(data?.consultations)) return data.consultations;
    if (Array.isArray(data?.reminders)) return data.reminders;
    return [];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const headers = getAuthHeaders();

      const [reportsResponse, consultationsResponse, remindersResponse] =
        await Promise.allSettled([
          fetch(`${API_BASE_URL}/reports/my-reports`, {
            method: "GET",
            headers,
          }),
          fetch(`${API_BASE_URL}/consultations/my-requests`, {
            method: "GET",
            headers,
          }),
          fetch(`${API_BASE_URL}/reminders/my`, {
            method: "GET",
            headers,
          }),
        ]);

      if (reportsResponse.status === "fulfilled") {
        const data = await reportsResponse.value.json().catch(() => null);

        if (reportsResponse.value.ok) {
          setReports(normalizeList(data));
        }
      }

      if (consultationsResponse.status === "fulfilled") {
        const data = await consultationsResponse.value.json().catch(() => null);

        if (consultationsResponse.value.ok) {
          setConsultations(normalizeList(data));
        }
      }

      if (remindersResponse.status === "fulfilled") {
        const data = await remindersResponse.value.json().catch(() => null);

        if (remindersResponse.value.ok) {
          setReminders(normalizeList(data));
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => {
        const aDate = new Date(a.uploaded_at || a.created_at || "").getTime();
        const bDate = new Date(b.uploaded_at || b.created_at || "").getTime();
        return bDate - aDate;
      })
      .slice(0, 3);
  }, [reports]);

  const upcomingReminders = useMemo(() => {
    return [...reminders].slice(0, 3);
  }, [reminders]);

  const pendingConsultations = consultations.filter((item) =>
    String(item.status || "").toLowerCase().includes("pending")
  ).length;

  const formatDate = (value?: string) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const quickActions = [
    {
      title: "Upload Report",
      description: "Upload a new medical report",
      href: "/patient/upload-report",
      icon: <UploadCloud size={26} />,
      iconClass: "bg-blue-100 text-blue-700",
    },
    {
      title: "Report History",
      description: "View uploaded reports and AI analysis",
      href: "/patient/report-history",
      icon: <History size={26} />,
      iconClass: "bg-cyan-100 text-cyan-700",
    },
    {
      title: "Compare Reports",
      description: "Compare lab changes between two reports",
      href: "/patient/compare-reports",
      icon: <BarChart3 size={26} />,
      iconClass: "bg-violet-100 text-violet-700",
    },
    {
      title: "My Consultations",
      description: "View doctor consultation requests and status",
      href: "/patient/consultations",
      icon: <MessageSquareText size={26} />,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["patient", "Patient"]}>
      <>
        <AppNavbar />

        <main className="bg-slate-50 px-6 py-8">
          <section className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 shadow-xl">
              <div className="flex flex-col gap-6 px-8 py-10 text-white md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                    <ShieldCheck size={18} />
                    Patient Health Center
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    Welcome back, {user?.full_name || "Patient"}
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    Upload reports, view AI insights, compare health results,
                    and request doctor consultations securely.
                  </p>
                </div>

                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur">
                  <Stethoscope size={58} />
                </div>
              </div>
            </div>

            {loading && (
              <div className="mt-8 flex min-h-[260px] items-center justify-center rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="font-semibold">Loading dashboard...</span>
                </div>
              </div>
            )}

            {!loading && errorMessage && (
              <div className="mt-8 rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-700">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} />
                  <div>
                    <h2 className="font-bold">Unable to load dashboard</h2>
                    <p className="mt-1 text-sm">{errorMessage}</p>

                    <button
                      onClick={fetchDashboardData}
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !errorMessage && (
              <>
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <StatCard
                    title="Uploaded Reports"
                    value={reports.length}
                    icon={<FileText size={26} />}
                    colorClass="bg-blue-100 text-blue-700"
                  />

                  <StatCard
                    title="Consultations"
                    value={consultations.length}
                    icon={<MessageSquareText size={26} />}
                    colorClass="bg-cyan-100 text-cyan-700"
                  />

                  <StatCard
                    title="Pending Requests"
                    value={pendingConsultations}
                    icon={<Clock size={26} />}
                    colorClass="bg-amber-100 text-amber-700"
                  />
                </div>

                <div className="mt-8 space-y-6">
                  {/* Quick Actions */}
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-slate-950">
                        Quick Actions
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Access your important patient tools from here.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                      {quickActions.map((action) => (
                        <Link
                          key={action.href}
                          href={action.href}
                          className="group rounded-[26px] border border-slate-200 bg-slate-50/70 p-6 transition hover:border-blue-200 hover:bg-white hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.iconClass}`}
                            >
                              {action.icon}
                            </div>

                            <ArrowRight
                              size={22}
                              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                            />
                          </div>

                          <h3 className="mt-6 text-xl font-bold text-slate-950">
                            {action.title}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {action.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Recent Reports */}
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-950">
                          Recent Reports
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Your latest uploaded medical reports.
                        </p>
                      </div>

                      <Link
                        href="/patient/report-history"
                        className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        View all
                      </Link>
                    </div>

                    {recentReports.length === 0 ? (
                      <EmptyMiniState
                        icon={<FileText size={28} />}
                        title="No reports yet"
                        description="Upload your first medical report."
                      />
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {recentReports.map((report) => (
                          <Link
                            key={String(report.id || report.report_id)}
                            href={`/patient/report-history/${report.id || report.report_id}`}
                            className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-blue-200 hover:bg-white hover:shadow-sm"
                          >
                            <p className="line-clamp-2 text-sm font-bold text-slate-900">
                              {report.file_name ||
                                report.filename ||
                                "Medical Report"}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                              {formatDate(
                                report.uploaded_at || report.created_at
                              )}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upcoming Reminders */}
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5">
                      <h2 className="text-2xl font-bold text-slate-950">
                        Upcoming Reminders
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Track your pending health reminders.
                      </p>
                    </div>

                    {upcomingReminders.length === 0 ? (
                      <EmptyMiniState
                        icon={<CalendarDays size={28} />}
                        title="No reminders"
                        description="Your reminders will appear here."
                      />
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {upcomingReminders.map((reminder) => (
                          <div
                            key={String(reminder.id)}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                          >
                            <p className="text-sm font-bold text-slate-900">
                              {reminder.title || "Reminder"}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                              Due:{" "}
                              {formatDate(
                                reminder.due_date || reminder.reminder_date
                              )}
                            </p>

                            <span className="mt-3 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                              {reminder.status || "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}

function StatCard({
  title,
  value,
  icon,
  colorClass,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-extrabold text-slate-950">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3 ${colorClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyMiniState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}