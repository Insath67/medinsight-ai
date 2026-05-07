"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  MailCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!email.trim()) {
        throw new Error("Email is missing. Please enter your email.");
      }

      if (!otp.trim()) {
        throw new Error("Please enter the verification code.");
      }

      if (otp.trim().length !== 6) {
        throw new Error("Verification code must be 6 digits.");
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Email verification failed. Please try again."
        );
      }

      const role = String(data?.role || "").toLowerCase();
      const accountStatus = String(data?.account_status || "").toLowerCase();

      if (role === "doctor" && accountStatus === "pending") {
        setSuccessMessage(
          "Email verified successfully. Your doctor account is now pending admin approval."
        );
      } else {
        setSuccessMessage("Email verified successfully. You can now login.");
      }

      setTimeout(() => {
        router.push("/login");
      }, 1600);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!email.trim()) {
        throw new Error("Please enter your email before resending the code.");
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/resend-verification-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to resend verification code."
        );
      }

      setSuccessMessage("New verification code sent to your email.");
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setResending(false);
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
                  Secure Email Verification
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                  Verify Email
                </h1>

                <p className="mt-3 text-base text-blue-50">
                  Enter the 6-digit code sent to your email.
                </p>
              </div>

              <div className="hidden h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur md:flex">
                <MailCheck size={50} />
              </div>
            </div>
          </div>

          <form onSubmit={handleVerifyEmail} className="space-y-6 px-8 py-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-950">
                Confirm your email
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Your account will be activated after successful verification.
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

            <div>
              <label className="mb-2 block text-base font-bold text-slate-800">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-slate-800">
                Verification Code
              </label>

              <div className="relative">
                <KeyRound
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={otp}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    setOtp(onlyNumbers);
                  }}
                  placeholder="Enter 6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-14 pr-5 text-center text-2xl font-extrabold tracking-[0.4em] text-slate-900 outline-none transition placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                  Verifying...
                </>
              ) : (
                <>
                  <MailCheck size={20} />
                  Verify & Activate Account
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending...
                </>
              ) : (
                <>
                  <RotateCcw size={20} />
                  Resend Verification Code
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="animate-spin" size={24} />
            Loading verification page...
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}