"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";

type Consultation = {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id?: string | null;
  doctor_name?: string | null;
  report_id: string;
  report_name?: string;
  patient_message: string;
  status: string;
  created_at?: string;
};

export default function DoctorConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
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

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/consultations/doctor-requests`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Failed to load doctor consultation requests."
        );
      }

      const data = await response.json();
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const updateConsultationStatus = async (
    consultationId: string,
    action: "accept" | "decline"
  ) => {
    try {
      setActionLoadingId(consultationId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/consultations/${consultationId}/${action}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Failed to ${action} consultation request.`
        );
      }

      setSuccessMessage(
        action === "accept"
          ? "Consultation accepted successfully."
          : "Consultation declined successfully."
      );

      await fetchConsultations();
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setActionLoadingId("");
    }
  };

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

  const getStatusStyle = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "active") {
      return {
        icon: <CheckCircle2 size={16} />,
        className: "bg-green-50 text-green-700 border-green-200",
        label: "Active",
      };
    }

    if (normalized === "declined") {
      return {
        icon: <XCircle size={16} />,
        className: "bg-red-50 text-red-700 border-red-200",
        label: "Declined",
      };
    }

    if (normalized === "pending_doctor_acceptance") {
      return {
        icon: <Clock size={16} />,
        className: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Pending",
      };
    }

    return {
      icon: <Clock size={16} />,
      className: "bg-slate-50 text-slate-700 border-slate-200",
      label: status,
    };
  };

  const canTakeAction = (status: string) => {
    return status.toLowerCase() === "pending_doctor_acceptance";
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
                    <ShieldCheck size={18} />
                    Doctor Consultation Center
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    Consultation Requests
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    Review patient consultation requests and accept or decline
                    them.
                  </p>
                </div>

                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur">
                  <Stethoscope size={48} />
                </div>
              </div>
            </div>

            {loading && (
              <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="font-medium">
                    Loading consultation requests...
                  </span>
                </div>
              </div>
            )}

            {!loading && errorMessage && (
              <div className="mt-8 rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} />
                  <div>
                    <h2 className="font-semibold">
                      Unable to load consultations
                    </h2>
                    <p className="mt-1 text-sm">{errorMessage}</p>

                    <button
                      onClick={fetchConsultations}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !errorMessage && (
              <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Patient Requests
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      New and previous consultation requests assigned to you.
                    </p>
                  </div>

                  <button
                    onClick={fetchConsultations}
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

                {consultations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <MessageSquareText
                      className="mx-auto text-slate-400"
                      size={42}
                    />
                    <h3 className="mt-4 text-lg font-bold text-slate-800">
                      No consultation requests yet
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Patient requests assigned to you will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((item) => {
                      const status = getStatusStyle(item.status);
                      const isLoadingThis = actionLoadingId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                        >
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                <UserRound size={26} />
                              </div>

                              <div>
                                <h3 className="text-lg font-bold text-slate-950">
                                  {item.patient_name || "Patient"}
                                </h3>

                                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                                  <span className="inline-flex items-center gap-2">
                                    <FileText size={16} />
                                    {item.report_name || "Medical Report"}
                                  </span>

                                  <span className="inline-flex items-center gap-2">
                                    <CalendarDays size={16} />
                                    {formatDate(item.created_at)}
                                  </span>
                                </div>

                                <p className="mt-4 max-w-3xl rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700">
                                  {item.patient_message}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-3 xl:items-end">
                              <div
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${status.className}`}
                              >
                                {status.icon}
                                {status.label}
                              </div>

                              {canTakeAction(item.status) && (
                                <div className="flex flex-wrap gap-3">
                                  <button
                                    onClick={() =>
                                      updateConsultationStatus(item.id, "accept")
                                    }
                                    disabled={isLoadingThis}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isLoadingThis ? (
                                      <Loader2
                                        className="animate-spin"
                                        size={18}
                                      />
                                    ) : (
                                      <CheckCircle2 size={18} />
                                    )}
                                    Accept
                                  </button>

                                  <button
                                    onClick={() =>
                                      updateConsultationStatus(
                                        item.id,
                                        "decline"
                                      )
                                    }
                                    disabled={isLoadingThis}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isLoadingThis ? (
                                      <Loader2
                                        className="animate-spin"
                                        size={18}
                                      />
                                    ) : (
                                      <XCircle size={18} />
                                    )}
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}