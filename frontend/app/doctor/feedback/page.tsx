"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  CalendarDays,
  Loader2,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

type FeedbackItem = {
  id?: string;
  consultation_id?: string;
  patient_id?: string;
  patient_name?: string;
  doctor_id?: string;
  rating?: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
};

export default function DoctorFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
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

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/feedback/doctor/my-feedback`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to load feedback.");
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.feedback || data.data || data.items || [];

      setFeedbackList(Array.isArray(list) ? list : []);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
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

  const renderStars = (rating?: number) => {
    const safeRating = Number(rating || 0);

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((item) => (
          <Star
            key={item}
            size={18}
            className={
              item <= safeRating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }
          />
        ))}
        <span className="ml-2 text-sm font-bold text-slate-700">
          {safeRating}/5
        </span>
      </div>
    );
  };

  const averageRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          feedbackList.length
        ).toFixed(1)
      : "0.0";

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
                    Doctor Feedback Center
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    Patient Feedback
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    View ratings and comments submitted by patients after
                    consultations.
                  </p>
                </div>

                <div className="rounded-[28px] bg-white/15 px-8 py-6 text-center backdrop-blur">
                  <p className="text-sm text-blue-50">Average Rating</p>
                  <p className="mt-2 text-4xl font-bold">{averageRating}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Received Feedback
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    All feedback submitted for your consultations.
                  </p>
                </div>

                <button
                  onClick={fetchFeedback}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {loading && (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-medium">Loading feedback...</span>
                  </div>
                </div>
              )}

              {!loading && errorMessage && (
                <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={24} />
                    <div>
                      <h2 className="font-semibold">Unable to load feedback</h2>
                      <p className="mt-1 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {!loading && !errorMessage && feedbackList.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <MessageSquareText
                    className="mx-auto text-slate-400"
                    size={42}
                  />
                  <h3 className="mt-4 text-lg font-bold text-slate-800">
                    No feedback yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Patient feedback will appear here after consultations.
                  </p>
                </div>
              )}

              {!loading && !errorMessage && feedbackList.length > 0 && (
                <div className="space-y-4">
                  {feedbackList.map((item, index) => (
                    <div
                      key={item.id || `${item.consultation_id}-${index}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <UserRound size={26} />
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-slate-950">
                              {item.patient_name || "Patient Feedback"}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                              {renderStars(item.rating)}

                              <span className="inline-flex items-center gap-2">
                                <CalendarDays size={16} />
                                {formatDate(item.created_at || item.updated_at)}
                              </span>
                            </div>

                            <p className="mt-4 max-w-3xl rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700">
                              {item.comment || "No comment provided."}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
                          Consultation Feedback
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}