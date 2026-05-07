"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Star,
  Stethoscope,
  X,
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

type FeedbackForm = {
  rating: number;
  comment: string;
};

export default function PatientConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);

  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    rating: 5,
    comment: "",
  });

  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

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

      const response = await fetch(`${API_BASE_URL}/consultations/my-requests`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Failed to load consultation requests."
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
        label: "Pending Doctor Acceptance",
      };
    }

    return {
      icon: <Clock size={16} />,
      className: "bg-slate-50 text-slate-700 border-slate-200",
      label: status,
    };
  };

  const openFeedbackModal = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setFeedbackForm({
      rating: 5,
      comment: "",
    });
    setFeedbackSuccess("");
    setFeedbackError("");
  };

  const closeFeedbackModal = () => {
    setSelectedConsultation(null);
    setFeedbackSuccess("");
    setFeedbackError("");
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedConsultation) return;

    try {
      setFeedbackSubmitting(true);
      setFeedbackSuccess("");
      setFeedbackError("");

      if (!feedbackForm.comment.trim()) {
        throw new Error("Please enter your feedback comment.");
      }

      const response = await fetch(
        `${API_BASE_URL}/feedback/${selectedConsultation.id}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            rating: feedbackForm.rating,
            comment: feedbackForm.comment.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to submit feedback.");
      }

      setFeedbackSuccess("Feedback submitted successfully.");

      setTimeout(() => {
        closeFeedbackModal();
      }, 900);
    } catch (error: any) {
      setFeedbackError(error.message || "Something went wrong.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Patient", "patient"]}>
      <>
        <AppNavbar />

        <main className="min-h-screen bg-slate-50 px-6 py-8">
          <section className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 shadow-xl">
              <div className="flex flex-col gap-6 px-8 py-10 text-white md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                    <ShieldCheck size={18} />
                    Patient Consultation Center
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    My Consultations
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    Track your doctor consultation requests, current status, and
                    submit feedback after consultation.
                  </p>
                </div>

                <Link
                  href="/patient/consultations/new"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
                >
                  <Plus size={18} />
                  New Consultation
                </Link>
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
                      Consultation Requests
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Your submitted consultation requests are listed here.
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
                      Send a request to a doctor for one of your uploaded
                      reports.
                    </p>

                    <Link
                      href="/patient/consultations/new"
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <Plus size={18} />
                      Create Request
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((item) => {
                      const status = getStatusStyle(item.status);
                      const isActive = item.status.toLowerCase() === "active";

                      return (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                <Stethoscope size={26} />
                              </div>

                              <div>
                                <h3 className="text-lg font-bold text-slate-950">
                                  Dr. {item.doctor_name || "Assigned Doctor"}
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

                            <div className="flex flex-col items-start gap-3 lg:items-end">
                              <div
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${status.className}`}
                              >
                                {status.icon}
                                {status.label}
                              </div>

                              {isActive && (
                                <button
                                  onClick={() => openFeedbackModal(item)}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                                >
                                  <Star size={17} />
                                  Give Feedback
                                </button>
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

        {selectedConsultation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Give Feedback
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Share your experience about Dr.{" "}
                    {selectedConsultation.doctor_name || "Doctor"}.
                  </p>
                </div>

                <button
                  onClick={closeFeedbackModal}
                  className="rounded-2xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              {feedbackSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={18} />
                  {feedbackSuccess}
                </div>
              )}

              {feedbackError && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  <AlertCircle size={18} />
                  {feedbackError}
                </div>
              )}

              <form onSubmit={submitFeedback} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Rating
                  </label>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          setFeedbackForm((prev) => ({
                            ...prev,
                            rating,
                          }))
                        }
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-bold transition ${
                          feedbackForm.rating >= rating
                            ? "border-amber-300 bg-amber-50 text-amber-600"
                            : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        <Star
                          size={20}
                          className={
                            feedbackForm.rating >= rating ? "fill-current" : ""
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Comment
                  </label>

                  <textarea
                    value={feedbackForm.comment}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    rows={5}
                    placeholder="Example: Doctor reviewed my report clearly and gave useful advice."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeFeedbackModal}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {feedbackSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    </ProtectedRoute>
  );
}