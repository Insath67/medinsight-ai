"use client";

import React, { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!email.trim()) {
        throw new Error("Please enter your email address.");
      }

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to send password reset link. Please try again."
        );
      }

      setSuccessMessage(
        data?.message || "Password reset link has been sent to your email."
      );
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
                  Secure Password Recovery
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                  Forgot Password
                </h1>

                <p className="mt-3 text-base text-blue-50">
                  Enter your email to receive a secure password reset link.
                </p>
              </div>

              <div className="hidden h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur md:flex">
                <KeyRound size={50} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-950">
                Recover your account
              </h2>
              <p className="mt-2 text-base text-slate-600">
                We’ll send a reset link to your registered email.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-semibold text-green-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p>{successMessage}</p>
                    <p className="mt-2 text-sm font-medium text-green-700/80">
                      Please check your inbox and click the reset link. The link
                      will expire in 15 minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-base font-bold text-slate-800">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-14 pr-5 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
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
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <KeyRound size={20} />
                  Send Reset Link
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