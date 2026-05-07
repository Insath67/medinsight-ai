"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ShieldCheck,
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const decodeJwtPayload = (token: string) => {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  };

  const saveAuthData = (token: string, userData: any) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("token", token);

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("auth_user", JSON.stringify(userData));
    }
  };

  const getRedirectPath = (roleValue: string) => {
    const role = String(roleValue || "").toLowerCase();

    if (role === "doctor") {
      return "/doctor/dashboard";
    }

    if (role === "admin") {
      return "/admin/dashboard";
    }

    return "/patient/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      if (!email.trim()) {
        throw new Error("Please enter your email.");
      }

      if (!password.trim()) {
        throw new Error("Please enter your password.");
      }

      const formData = new URLSearchParams();
      formData.append("username", email.trim());
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || "Login failed. Please try again."
        );
      }

      const token = data?.access_token || data?.token;

      if (!token) {
        throw new Error("Login token not received from server.");
      }

      const jwtPayload = decodeJwtPayload(token);

      const userData = data?.user || {
        id:
          data?.id ||
          data?.user_id ||
          jwtPayload?.sub ||
          jwtPayload?.user_id ||
          jwtPayload?.id ||
          "",
        name:
          data?.name ||
          data?.full_name ||
          jwtPayload?.name ||
          jwtPayload?.full_name ||
          "",
        email:
          data?.email ||
          jwtPayload?.email ||
          email.trim(),
        role:
          data?.role ||
          jwtPayload?.role ||
          jwtPayload?.user_role ||
          "patient",
      };

      saveAuthData(token, userData);

      router.push(getRedirectPath(userData.role));
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 px-8 py-10 text-white">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
              <ShieldCheck size={18} />
              Secure Access
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              MedInsight AI
            </h1>

            <p className="mt-3 text-base text-blue-50">
              Smart Medical Report Analysis
            </p>
          </div>

          <div className="hidden h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur md:flex">
            <LogIn size={50} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-950">Sign in</h2>
          <p className="mt-2 text-base text-slate-600">
            Login to access your dashboard and AI insights
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle size={18} />
            {errorMessage}
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
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-14 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-600"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
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
              Signing in...
            </>
          ) : (
            <>
              <LogIn size={20} />
              Sign In
            </>
          )}
        </button>

        <div className="flex flex-col items-center justify-center gap-3 text-sm">
          <Link href="/forgot-password" className="font-semibold text-blue-600">
            Forgot Password?
          </Link>

          <p className="text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-blue-600">
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}