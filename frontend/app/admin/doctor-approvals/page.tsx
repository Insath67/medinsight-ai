"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  Award,
  BriefcaseMedical,
  Building2,
  CheckCircle2,
  Clock,
  FileBadge,
  GraduationCap,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";

type DoctorProfile = {
  id?: string;
  user_id?: string;

  full_name?: string;
  email?: string;
  phone?: string | null;
  account_status?: string;

  specialization?: string;
  hospital_name?: string;
  qualification?: string;
  license_number?: string;
  experience_years?: number;
  bio?: string;
  approval_status?: string;
  rejection_reason?: string | null;
};

export default function AdminDoctorApprovalsPage() {
  const [pendingDoctors, setPendingDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
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

  const normalizeList = (data: any): DoctorProfile[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.doctors)) return data.doctors;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/admin/doctors/pending`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to load pending doctors.");
      }

      setPendingDoctors(normalizeList(data));
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const approveDoctor = async (doctorProfileId: string) => {
    try {
      setActionLoadingId(doctorProfileId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/admin/doctors/${doctorProfileId}/approve`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to approve doctor.");
      }

      setSuccessMessage("Doctor approved successfully.");
      await fetchPendingDoctors();
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setActionLoadingId("");
    }
  };

  const rejectDoctor = async (doctorProfileId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this doctor profile?"
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(doctorProfileId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/admin/doctors/${doctorProfileId}/reject`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            rejection_reason: "Doctor profile rejected by admin.",
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to reject doctor.");
      }

      setSuccessMessage("Doctor rejected successfully.");
      await fetchPendingDoctors();
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setActionLoadingId("");
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
                    Admin Doctor Verification
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    Doctor Approvals
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    Review pending doctor registrations and approve or reject
                    access to the doctor portal.
                  </p>
                </div>

                <div className="rounded-[28px] bg-white/15 px-8 py-6 text-center backdrop-blur">
                  <p className="text-sm text-blue-50">Pending</p>
                  <p className="mt-2 text-4xl font-bold">
                    {pendingDoctors.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Pending Doctor Requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Verify doctor registration details before approval.
                  </p>
                </div>

                <button
                  onClick={fetchPendingDoctors}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {successMessage && (
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={18} />
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
                    <span className="font-semibold">
                      Loading pending doctors...
                    </span>
                  </div>
                </div>
              )}

              {!loading && !errorMessage && pendingDoctors.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <CheckCircle2 className="mx-auto text-green-500" size={44} />
                  <h3 className="mt-4 text-lg font-bold text-slate-800">
                    No pending doctor approvals
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    New doctor registration requests will appear here.
                  </p>
                </div>
              )}

              {!loading && pendingDoctors.length > 0 && (
                <div className="space-y-5">
                  {pendingDoctors.map((doctor) => {
                    const doctorProfileId = String(doctor.id || "");
                    const isActionLoading = actionLoadingId === doctorProfileId;

                    return (
                      <div
                        key={doctorProfileId}
                        className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-6"
                      >
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                          <div className="flex flex-1 gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                              <Stethoscope size={32} />
                            </div>

                            <div className="w-full">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-2xl font-bold text-slate-950">
                                  Dr. {doctor.full_name || "Doctor"}
                                </h3>

                                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                  <Clock size={14} />
                                  Pending Approval
                                </span>
                              </div>

                              <p className="mt-1 text-sm font-semibold text-cyan-700">
                                {doctor.specialization ||
                                  "Specialization not provided"}
                              </p>

                              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <Mail size={15} />
                                {doctor.email || "Email not available"}
                              </p>

                              <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  System Details
                                </p>

                                <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                                  <p>
                                    Doctor Profile ID:{" "}
                                    <span className="font-semibold text-slate-800">
                                      {doctorProfileId}
                                    </span>
                                  </p>

                                  <p>
                                    User ID:{" "}
                                    <span className="font-semibold text-slate-800">
                                      {doctor.user_id || "N/A"}
                                    </span>
                                  </p>

                                  <p>
                                    User Account Status:{" "}
                                    <span className="font-semibold text-slate-800">
                                      {doctor.account_status || "N/A"}
                                    </span>
                                  </p>

                                  <p>
                                    Approval Status:{" "}
                                    <span className="font-semibold text-slate-800">
                                      {doctor.approval_status || "pending"}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <InfoItem
                                  icon={<Building2 size={18} />}
                                  label="Working Hospital / Clinic"
                                  value={doctor.hospital_name || "N/A"}
                                />

                                <InfoItem
                                  icon={<FileBadge size={18} />}
                                  label="Medical Registration Number"
                                  value={doctor.license_number || "N/A"}
                                />

                                <InfoItem
                                  icon={<Award size={18} />}
                                  label="Specialization"
                                  value={doctor.specialization || "N/A"}
                                />

                                <InfoItem
                                  icon={<BriefcaseMedical size={18} />}
                                  label="Experience"
                                  value={`${
                                    doctor.experience_years ?? 0
                                  } year(s)`}
                                />

                                <InfoItem
                                  icon={<GraduationCap size={18} />}
                                  label="Qualification"
                                  value={doctor.qualification || "N/A"}
                                />

                                <InfoItem
                                  icon={<UserRound size={18} />}
                                  label="Email"
                                  value={doctor.email || "N/A"}
                                />
                              </div>

                              <div className="mt-5 rounded-2xl bg-white px-4 py-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Bio
                                </p>
                                <p className="mt-2 text-sm leading-7 text-slate-700">
                                  {doctor.bio || "No bio provided."}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
                            <button
                              onClick={() => approveDoctor(doctorProfileId)}
                              disabled={isActionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isActionLoading ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <CheckCircle2 size={18} />
                              )}
                              Approve
                            </button>

                            <button
                              onClick={() => rejectDoctor(doctorProfileId)}
                              disabled={isActionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isActionLoading ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <XCircle size={18} />
                              )}
                              Reject
                            </button>
                          </div>
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

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}