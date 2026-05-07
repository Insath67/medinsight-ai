"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Send,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

type ReportItem = {
  id?: string;
  report_id?: string;
  file_name?: string;
  filename?: string;
  report_type?: string;
  type?: string;
  uploaded_at?: string;
  created_at?: string;
};

type DoctorItem = {
  id: string;
  user_id: string;
  specialization?: string;
  hospital_name?: string;
  qualification?: string;
  experience_years?: number;
  approval_status?: string;
};

export default function NewConsultationPage() {
  const router = useRouter();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);

  const [formData, setFormData] = useState({
    report_id: "",
    doctor_user_id: "",
    patient_message: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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

  const normalizeReports = (data: any): ReportItem[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reports)) return data.reports;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const headers = getAuthHeaders();

      const reportsResponse = await fetch(`${API_BASE_URL}/reports/my-reports`, {
        method: "GET",
        headers,
      });

      if (!reportsResponse.ok) {
        const errorData = await reportsResponse.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to load your reports.");
      }

      const reportsData = await reportsResponse.json();
      const reportList = normalizeReports(reportsData);
      setReports(reportList);

      const doctorsResponse = await fetch(`${API_BASE_URL}/doctors/approved`, {
        method: "GET",
        headers,
      });

      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      }

      if (reportList.length > 0) {
        const firstReportId = String(
          reportList[0].id || reportList[0].report_id || ""
        );

        setFormData((prev) => ({
          ...prev,
          report_id: firstReportId,
        }));
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      if (!formData.report_id) {
        throw new Error("Please select a report.");
      }

      if (!formData.doctor_user_id.trim()) {
        throw new Error("Please select or enter doctor user ID.");
      }

      if (!formData.patient_message.trim()) {
        throw new Error("Please enter a consultation message.");
      }

      const response = await fetch(`${API_BASE_URL}/consultations/request`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          report_id: formData.report_id,
          doctor_user_id: formData.doctor_user_id.trim(),
          patient_message: formData.patient_message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Failed to send consultation request."
        );
      }

      setSuccessMessage("Consultation request sent successfully.");

      setTimeout(() => {
        router.push("/patient/consultations");
      }, 900);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const getReportName = (report: ReportItem) => {
    return report.file_name || report.filename || "Unnamed Report";
  };

  return (
    <ProtectedRoute allowedRoles={["Patient", "patient"]}>
      <>
        <AppNavbar />

        <main className="min-h-screen bg-slate-50 px-6 py-8">
          <section className="mx-auto max-w-5xl">
            <button
              onClick={() => router.push("/patient/consultations")}
              className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
              Back to Consultations
            </button>

            <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 shadow-xl">
              <div className="px-8 py-10 text-white">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                  <ShieldCheck size={18} />
                  Secure Consultation Request
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                  Request a Consultation
                </h1>

                <p className="mt-3 max-w-2xl text-base text-blue-50">
                  Select your medical report and send a message to a doctor for
                  review.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              {loading ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-medium">Loading form data...</span>
                  </div>
                </div>
              ) : (
                <>
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

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Select Report
                      </label>

                      <div className="relative">
                        <FileText
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          name="report_id"
                          value={formData.report_id}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                        >
                          <option value="">Select a report</option>

                          {reports.map((report) => {
                            const id = String(
                              report.id || report.report_id || ""
                            );

                            return (
                              <option key={id} value={id}>
                                {getReportName(report)}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {reports.length === 0 && (
                        <p className="mt-2 text-sm text-red-500">
                          No reports found. Upload a report first.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Select Doctor
                      </label>

                      {doctors.length > 0 ? (
                        <div className="relative">
                          <Stethoscope
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <select
                            name="doctor_user_id"
                            value={formData.doctor_user_id}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                          >
                            <option value="">Select a doctor</option>

                            {doctors.map((doctor) => (
                              <option key={doctor.id} value={doctor.user_id}>
                                Dr. {doctor.specialization || "Doctor"}{" "}
                                {doctor.hospital_name
                                  ? `- ${doctor.hospital_name}`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <input
                            name="doctor_user_id"
                            value={formData.doctor_user_id}
                            onChange={handleChange}
                            placeholder="Paste doctor user ID here"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                          />

                          <p className="mt-2 text-xs text-slate-500">
                            Approved doctor list is empty, so paste doctor user
                            ID manually for now.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Message to Doctor
                      </label>

                      <textarea
                        name="patient_message"
                        value={formData.patient_message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Example: I would like to consult about my blood sugar report. Please review it and advise me."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Send Request
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}