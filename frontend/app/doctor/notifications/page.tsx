"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

type NotificationItem = {
  id?: string;
  notification_id?: string;
  title?: string;
  message?: string;
  type?: string;
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
};

export default function DoctorNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/notifications/my`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to load notifications.");
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.notifications || data.data || data.items || [];

      setNotifications(Array.isArray(list) ? list : []);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationId = (item: NotificationItem) => {
    return String(item.id || item.notification_id || "");
  };

  const isRead = (item: NotificationItem) => {
    return Boolean(item.is_read || item.read);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setActionLoadingId(notificationId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/notifications/read/${notificationId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to mark notification as read.");
      }

      setSuccessMessage("Notification marked as read.");
      await fetchNotifications();
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

  const unreadCount = notifications.filter((item) => !isRead(item)).length;

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
                    Doctor Notification Center
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    My Notifications
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    View consultation alerts, patient updates, and system messages.
                  </p>
                </div>

                <div className="rounded-[28px] bg-white/15 px-8 py-6 text-center backdrop-blur">
                  <p className="text-sm text-blue-50">Unread</p>
                  <p className="mt-2 text-4xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Notification List
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Doctor-related notifications are listed here.
                  </p>
                </div>

                <button
                  onClick={fetchNotifications}
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

              {loading && (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-medium">Loading notifications...</span>
                  </div>
                </div>
              )}

              {!loading && errorMessage && (
                <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={24} />
                    <div>
                      <h2 className="font-semibold">Unable to load notifications</h2>
                      <p className="mt-1 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {!loading && !errorMessage && notifications.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <Bell className="mx-auto text-slate-400" size={42} />
                  <h3 className="mt-4 text-lg font-bold text-slate-800">
                    No notifications yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Your doctor updates will appear here.
                  </p>
                </div>
              )}

              {!loading && !errorMessage && notifications.length > 0 && (
                <div className="space-y-4">
                  {notifications.map((item, index) => {
                    const notificationId = getNotificationId(item);
                    const read = isRead(item);
                    const isLoadingThis = actionLoadingId === notificationId;

                    return (
                      <div
                        key={notificationId || index}
                        className={`rounded-3xl border p-5 ${
                          read
                            ? "border-slate-200 bg-slate-50/70"
                            : "border-cyan-200 bg-cyan-50/70"
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex gap-4">
                            <div
                              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                                read
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-cyan-100 text-cyan-700"
                              }`}
                            >
                              <Stethoscope size={26} />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-950">
                                  {item.title || "Notification"}
                                </h3>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    read
                                      ? "bg-slate-200 text-slate-700"
                                      : "bg-cyan-600 text-white"
                                  }`}
                                >
                                  {read ? "Read" : "Unread"}
                                </span>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                  {item.type || "General"}
                                </span>

                                <span className="inline-flex items-center gap-2">
                                  <CalendarDays size={16} />
                                  {formatDate(item.created_at)}
                                </span>
                              </div>

                              <p className="mt-4 max-w-3xl rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700">
                                {item.message || "No message available."}
                              </p>
                            </div>
                          </div>

                          {!read && notificationId && (
                            <button
                              onClick={() => markAsRead(notificationId)}
                              disabled={isLoadingThis}
                              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isLoadingThis ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <CheckCircle2 size={18} />
                              )}
                              Mark as Read
                            </button>
                          )}
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