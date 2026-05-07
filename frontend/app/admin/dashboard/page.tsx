"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react";

type DoctorProfile = {
  id?: string;
  user_id?: string;
  specialization?: string;
  hospital_name?: string;
  qualification?: string;
  license_number?: string;
  experience_years?: number;
  bio?: string;
  approval_status?: string;
  rejection_reason?: string | null;
};

export default function AdminDashboardPage() {
  const [pendingDoctors, setPendingDoctors] = useState<DoctorProfile[]>([]);
  const [allDoctors, setAllDoctors] = useState<DoctorProfile[]>([]);
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

  const normalizeList = (data: any): DoctorProfile[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.doctors)) return data.doctors;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [pendingResponse, allResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/doctors/pending`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/admin/doctors/all`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
      ]);

      const pendingData = await pendingResponse.json().catch(() => null);
      const allData = await allResponse.json().catch(() => null);

      if (!pendingResponse.ok) {
        throw new Error(
          pendingData?.detail || "Failed to load pending doctors."
        );
      }

      if (!allResponse.ok) {
        throw new Error(allData?.detail || "Failed to load all doctors.");
      }

      setPendingDoctors(normalizeList(pendingData));
      setAllDoctors(normalizeList(allData));
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const approvedDoctors = allDoctors.filter(
    (doctor) => String(doctor.approval_status || "").toLowerCase() === "approved"
  );

  const rejectedDoctors = allDoctors.filter(
    (doctor) => String(doctor.approval_status || "").toLowerCase() === "rejected"
  );

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
                    Admin Control Center
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    Admin Dashboard
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    Monitor doctor approval requests and manage medical
                    professionals in the platform.
                  </p>
                </div>

                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur">
                  <ShieldCheck size={58} />
                </div>
              </div>
            </div>

            {loading && (
              <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="font-semibold">Loading admin data...</span>
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
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Doctors"
                    value={allDoctors.length}
                    icon={<Users size={26} />}
                    description="Registered doctor profiles"
                    colorClass="bg-blue-100 text-blue-700"
                  />

                  <StatCard
                    title="Pending Approval"
                    value={pendingDoctors.length}
                    icon={<Clock size={26} />}
                    description="Waiting admin review"
                    colorClass="bg-amber-100 text-amber-700"
                  />

                  <StatCard
                    title="Approved Doctors"
                    value={approvedDoctors.length}
                    icon={<CheckCircle2 size={26} />}
                    description="Allowed to use doctor portal"
                    colorClass="bg-green-100 text-green-700"
                  />

                  <StatCard
                    title="Rejected Doctors"
                    value={rejectedDoctors.length}
                    icon={<XCircle size={26} />}
                    description="Rejected doctor profiles"
                    colorClass="bg-red-100 text-red-700"
                  />
                </div>

                <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Recent Pending Doctors
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Doctors waiting for approval are listed here.
                      </p>
                    </div>

                    <button
                      onClick={fetchDashboardData}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <RefreshCw size={16} />
                      Refresh
                    </button>
                  </div>

                  {pendingDoctors.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <CheckCircle2
                        className="mx-auto text-green-500"
                        size={44}
                      />
                      <h3 className="mt-4 text-lg font-bold text-slate-800">
                        No pending doctors
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        All doctor registration requests have been reviewed.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {pendingDoctors.slice(0, 4).map((doctor) => (
                        <div
                          key={doctor.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                        >
                          <div className="flex gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                              <Stethoscope size={26} />
                            </div>

                            <div>
                              <h3 className="text-lg font-bold text-slate-950">
                                {doctor.specialization || "Doctor"}
                              </h3>

                              <p className="mt-1 text-sm text-slate-600">
                                {doctor.hospital_name || "Hospital not provided"}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                                  License: {doctor.license_number || "N/A"}
                                </span>

                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                  Pending
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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

function StatCard({
  title,
  value,
  icon,
  description,
  colorClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-3 text-4xl font-extrabold text-slate-950">
            {value}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colorClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}