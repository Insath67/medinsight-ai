"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  UserRound,
  Users,
  UserX,
  XCircle,
} from "lucide-react";

type DoctorProfile = {
  id?: string;
  specialization?: string;
  hospital_name?: string;
  qualification?: string;
  license_number?: string;
  experience_years?: number;
  approval_status?: string;
};

type AdminUser = {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  account_status?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  doctor_profile?: DoctorProfile | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const normalizeList = (data: any): AdminUser[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to load users.");
      }

      setUsers(normalizeList(data));
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        String(user.full_name || "").toLowerCase().includes(keyword) ||
        String(user.email || "").toLowerCase().includes(keyword) ||
        String(user.role || "").toLowerCase().includes(keyword) ||
        String(user.account_status || "").toLowerCase().includes(keyword) ||
        String(user.doctor_profile?.specialization || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.doctor_profile?.hospital_name || "")
          .toLowerCase()
          .includes(keyword);

      const matchesRole =
        roleFilter === "all" ||
        String(user.role || "").toLowerCase() === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        String(user.account_status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const disableUser = async (user: AdminUser) => {
    const userId = String(user.id || "");

    if (!userId) return;

    const confirmed = window.confirm(
      `Are you sure you want to disable this account?\n\n${user.full_name || "User"}`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(userId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/disable`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to disable user.");
      }

      setSuccessMessage("User account disabled successfully.");
      await fetchUsers();
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setActionLoadingId("");
    }
  };

  const enableUser = async (user: AdminUser) => {
    const userId = String(user.id || "");

    if (!userId) return;

    try {
      setActionLoadingId(userId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/enable`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to reactivate user.");
      }

      setSuccessMessage("User account reactivated successfully.");
      await fetchUsers();
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setActionLoadingId("");
    }
  };

  const getRoleIcon = (role?: string) => {
    const normalized = String(role || "").toLowerCase();

    if (normalized === "doctor") return <Stethoscope size={22} />;
    if (normalized === "admin") return <ShieldCheck size={22} />;
    return <UserRound size={22} />;
  };

  const getStatusStyle = (status?: string) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "active") {
      return {
        icon: <CheckCircle2 size={15} />,
        className: "bg-green-100 text-green-700",
        label: "Active",
      };
    }

    if (normalized === "pending") {
      return {
        icon: <Clock size={15} />,
        className: "bg-amber-100 text-amber-700",
        label: "Pending",
      };
    }

    if (normalized === "email_pending") {
      return {
        icon: <Mail size={15} />,
        className: "bg-blue-100 text-blue-700",
        label: "Email Pending",
      };
    }

    if (normalized === "rejected") {
      return {
        icon: <XCircle size={15} />,
        className: "bg-red-100 text-red-700",
        label: "Rejected",
      };
    }

    if (normalized === "disabled") {
      return {
        icon: <UserX size={15} />,
        className: "bg-slate-200 text-slate-700",
        label: "Disabled",
      };
    }

    return {
      icon: <Clock size={15} />,
      className: "bg-slate-100 text-slate-700",
      label: status || "Unknown",
    };
  };

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(
    (user) => String(user.account_status || "").toLowerCase() === "active"
  ).length;
  const disabledUsers = users.filter(
    (user) => String(user.account_status || "").toLowerCase() === "disabled"
  ).length;
  const emailPendingUsers = users.filter(
    (user) => String(user.account_status || "").toLowerCase() === "email_pending"
  ).length;

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
                    Admin User Control
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    User Management
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    View platform accounts and disable or reactivate access
                    when required.
                  </p>
                </div>

                <div className="rounded-[28px] bg-white/15 px-8 py-6 text-center backdrop-blur">
                  <p className="text-sm text-blue-50">Total Users</p>
                  <p className="mt-2 text-4xl font-bold">{totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard title="Total Users" value={totalUsers} />
              <SummaryCard title="Active" value={activeUsers} />
              <SummaryCard title="Email Pending" value={emailPendingUsers} />
              <SummaryCard title="Disabled" value={disabledUsers} />
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    User Accounts
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Admin can view basic account details only. Sensitive medical
                    content is not displayed here.
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search users..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white lg:w-72"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="patient">Patients</option>
                    <option value="doctor">Doctors</option>
                    <option value="admin">Admins</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="email_pending">Email Pending</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="disabled">Disabled</option>
                  </select>

                  <button
                    onClick={fetchUsers}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
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
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-semibold">Loading users...</span>
                  </div>
                </div>
              )}

              {!loading && !errorMessage && filteredUsers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <Users className="mx-auto text-slate-400" size={44} />
                  <h3 className="mt-4 text-lg font-bold text-slate-800">
                    No users found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try changing the search keyword or filters.
                  </p>
                </div>
              )}

              {!loading && filteredUsers.length > 0 && (
                <div className="space-y-4">
                  {filteredUsers.map((user) => {
                    const userId = String(user.id || "");
                    const status = getStatusStyle(user.account_status);
                    const isActionLoading = actionLoadingId === userId;
                    const isDisabled =
                      String(user.account_status || "").toLowerCase() ===
                      "disabled";

                    return (
                      <div
                        key={userId}
                        className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5 transition hover:border-blue-200 hover:bg-white"
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                              {getRoleIcon(user.role)}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-xl font-bold text-slate-950">
                                  {user.full_name || "Unnamed User"}
                                </h3>

                                <span
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                                >
                                  {status.icon}
                                  {status.label}
                                </span>

                                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                                  {user.role || "N/A"}
                                </span>
                              </div>

                              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                                <Mail size={16} />
                                {user.email || "Email not available"}
                              </p>

                              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                                <p className="rounded-2xl bg-white px-4 py-3">
                                  <span className="font-bold text-slate-800">
                                    Email Verified:
                                  </span>{" "}
                                  {user.email_verified ? "Yes" : "No"}
                                </p>

                                <p className="rounded-2xl bg-white px-4 py-3">
                                  <span className="font-bold text-slate-800">
                                    Created:
                                  </span>{" "}
                                  {formatDate(user.created_at)}
                                </p>
                              </div>

                              {user.doctor_profile && (
                                <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-slate-700">
                                  <p className="font-bold text-cyan-800">
                                    Doctor Details
                                  </p>
                                  <p className="mt-1">
                                    {user.doctor_profile.specialization || "N/A"} •{" "}
                                    {user.doctor_profile.hospital_name || "N/A"}
                                  </p>
                                  <p className="mt-1">
                                    License:{" "}
                                    {user.doctor_profile.license_number || "N/A"} •
                                    Approval:{" "}
                                    {user.doctor_profile.approval_status || "N/A"}
                                  </p>
                                </div>
                              )}

                              <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-xs text-slate-500">
                                User ID: {userId}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
                            {isDisabled ? (
                              <button
                                onClick={() => enableUser(user)}
                                disabled={isActionLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <UserCheck size={18} />
                                )}
                                Reactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => disableUser(user)}
                                disabled={isActionLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <UserX size={18} />
                                )}
                                Disable
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
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h3 className="mt-2 text-3xl font-extrabold text-slate-950">{value}</h3>
    </div>
  );
}