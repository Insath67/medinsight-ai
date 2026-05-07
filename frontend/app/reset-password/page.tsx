"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenFromUrl = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [manualToken, setManualToken] = useState(tokenFromUrl);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTokenField, setShowTokenField] = useState(!tokenFromUrl);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeToken = tokenFromUrl || manualToken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!activeToken.trim()) {
        throw new Error("Reset token is missing. Please use a valid reset link.");
      }

      if (!newPassword.trim()) {
        throw new Error("Please enter your new password.");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: activeToken.trim(),
          new_password: newPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to reset password. Please try again."
        );
      }

      setSuccessMessage("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1300);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 px-8 py-10 text-white">
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                  <ShieldCheck size={18} />
                  Secure Password Reset
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                  Reset Password
                </h1>

                <p className="mt-3 text-base text-blue-50">
                  Choose a new secure password for your account.
                </p>
              </div>

              <div className="hidden h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur md:flex">
                <RotateCcw size={50} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-950">
                Create a new password
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Complete the reset process to regain access to your account.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                <CheckCircle2 size={18} />
                {successMessage}
              </div>
            )}

            {tokenFromUrl ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Reset token detected from secure link.
                </div>

                <button
                  type="button"
                  onClick={() => setShowTokenField((prev) => !prev)}
                  className="mt-2 text-xs font-bold text-green-800 underline"
                >
                  {showTokenField ? "Hide token" : "Show token"}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                Reset token missing. Please paste the token or go back to forgot
                password.
              </div>
            )}

            {showTokenField && (
              <div>
                <label className="mb-2 block text-base font-bold text-slate-800">
                  Reset Token
                </label>

                <div className="relative">
                  <KeyRound
                    size={20}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-14 pr-5 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-base font-bold text-slate-800">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-14 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-600"
                >
                  {showNewPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-slate-800">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-14 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={22} />
                  ) : (
                    <Eye size={22} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw size={20} />
                  Reset Password
                </>
              )}
            </button>

            <div className="flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600"
              >
                <ArrowLeft size={17} />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="animate-spin" size={24} />
            Loading reset page...
          </div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}