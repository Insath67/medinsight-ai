"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  UserRound,
} from "lucide-react";

type RegisterRole = "patient" | "doctor";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient" as RegisterRole,

    specialization: "",
    hospital_name: "",
    qualification: "",
    license_number: "",
    experience_years: "",
    bio: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleSelect = (role: RegisterRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const getFullName = () => {
    return `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!formData.first_name.trim()) {
        throw new Error("Please enter your first name.");
      }

      if (!formData.last_name.trim()) {
        throw new Error("Please enter your last name.");
      }

      if (!formData.email.trim()) {
        throw new Error("Please enter your email.");
      }

      if (!formData.password.trim()) {
        throw new Error("Please enter your password.");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      if (formData.role === "doctor") {
        if (!formData.specialization.trim()) {
          throw new Error("Please enter your specialization.");
        }

        if (!formData.hospital_name.trim()) {
          throw new Error("Please enter your working hospital or clinic.");
        }

        if (!formData.license_number.trim()) {
          throw new Error("Please enter your medical registration number.");
        }

        if (!formData.experience_years.trim()) {
          throw new Error("Please enter your years of experience.");
        }

        const experienceValue = Number(formData.experience_years);

        if (Number.isNaN(experienceValue) || experienceValue < 0) {
          throw new Error("Please enter a valid years of experience.");
        }
      }

      const fullName = getFullName();

      const payload =
        formData.role === "doctor"
          ? {
              full_name: fullName,
              email: formData.email.trim(),
              password: formData.password,
              phone: null,
              role: formData.role,
              specialization: formData.specialization.trim(),
              hospital_name: formData.hospital_name.trim(),
              qualification: formData.qualification.trim() || null,
              license_number: formData.license_number.trim(),
              experience_years: Number(formData.experience_years),
              bio: formData.bio.trim() || null,
            }
          : {
              full_name: fullName,
              email: formData.email.trim(),
              password: formData.password,
              phone: null,
              role: formData.role,
            };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Registration failed. Please try again."
        );
      }

      setSuccessMessage(
        formData.role === "doctor"
          ? "Verification code sent. Verify your email first, then admin will review your doctor account."
          : "Verification code sent. Please verify your email to activate your account."
      );

      setTimeout(() => {
        router.push(
          `/verify-email?email=${encodeURIComponent(formData.email.trim())}`
        );
      }, 1200);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 px-8 py-10 text-white">
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                  <ShieldCheck size={18} />
                  Secure Registration
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                  Create Account
                </h1>

                <p className="mt-3 text-base text-blue-50">
                  Enter your details and verify your email to activate your
                  account.
                </p>
              </div>

              <div className="hidden h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur md:flex">
                <MailCheck size={50} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
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
              <label className="mb-3 block text-base font-bold text-slate-800">
                Select Account Type
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("patient")}
                  className={`rounded-3xl border p-5 text-left transition ${
                    formData.role === "patient"
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        formData.role === "patient"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <UserRound size={24} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Patient
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Upload reports, view AI analysis, request consultations,
                        and chat with AI Doctor.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("doctor")}
                  className={`rounded-3xl border p-5 text-left transition ${
                    formData.role === "doctor"
                      ? "border-cyan-500 bg-cyan-50 shadow-md"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        formData.role === "doctor"
                          ? "bg-cyan-600 text-white"
                          : "bg-cyan-100 text-cyan-700"
                      }`}
                    >
                      <Stethoscope size={24} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Doctor
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Verify your email, then wait for admin approval.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-base font-bold text-slate-800">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-bold text-slate-800">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-slate-800">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {formData.role === "doctor" && (
              <div className="rounded-[28px] border border-cyan-200 bg-cyan-50/70 p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                    <Stethoscope size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      Doctor Verification Details
                    </h2>
                    <p className="text-sm text-slate-600">
                      These details will be reviewed by admin after email
                      verification.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-base font-bold text-slate-800">
                      Specialization
                    </label>
                    <input
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="Example: Cardiology"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-bold text-slate-800">
                      Working Hospital / Clinic
                    </label>
                    <input
                      name="hospital_name"
                      value={formData.hospital_name}
                      onChange={handleChange}
                      placeholder="Example: ABC Hospital"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-bold text-slate-800">
                      Medical Registration Number
                    </label>
                    <input
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleChange}
                      placeholder="Example: SLMC12345"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-bold text-slate-800">
                      Years of Experience
                    </label>
                    <input
                      name="experience_years"
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={handleChange}
                      placeholder="Example: 5"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-base font-bold text-slate-800">
                      Qualification
                    </label>
                    <input
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="Example: MBBS, MD"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-base font-bold text-slate-800">
                      Short Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Write a short professional bio..."
                      className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-base font-bold text-slate-800">
                Password
              </label>

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
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

            <div>
              <label className="mb-2 block text-base font-bold text-slate-800">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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
                  Sending Code...
                </>
              ) : (
                <>
                  <MailCheck size={20} />
                  Send Verification Code
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-blue-600">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}