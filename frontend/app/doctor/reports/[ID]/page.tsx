"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CalendarDays,
  FileText,
  HelpCircle,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  ClipboardPenLine,
  CheckCircle2,
} from "lucide-react";

type DoctorReport = {
  id: string;
  patient_id: string;
  patient_name: string;
  file_name: string;
  report_type: string;
  uploaded_at: string;
  status: string;
  notes?: string;
};

type ReportAnalysis = {
  id?: string | null;
  summary?: string | null;
  key_findings?: string | null;
  doctor_questions?: string | null;
  extracted_text?: string | null;
};

type DoctorReportResponse = {
  report: DoctorReport;
  analysis: ReportAnalysis | null;
};

type DoctorNote = {
  id: string;
  consultation_id?: string | null;
  report_id?: string | null;
  doctor_id: string;
  notes?: string | null;
  recommendations?: string | null;
  follow_up?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function DoctorReportDetailsPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const [reportId, setReportId] = useState("");
  const [data, setData] = useState<DoctorReportResponse | null>(null);
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>([]);

  const [noteForm, setNoteForm] = useState({
    notes: "",
    recommendations: "",
    follow_up: "",
  });

  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [noteSuccessMessage, setNoteSuccessMessage] = useState("");
  const [noteErrorMessage, setNoteErrorMessage] = useState("");

  useEffect(() => {
    const paramId = Array.isArray(params?.id)
      ? params.id[0]
      : typeof params?.id === "string"
      ? params.id
      : "";

    const pathId = pathname?.split("/").filter(Boolean).pop() || "";
    const finalId = paramId || pathId;

    if (finalId && finalId !== "undefined") {
      setReportId(finalId);
    } else {
      setErrorMessage("Report ID not found in URL.");
      setLoading(false);
    }
  }, [params, pathname]);

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

  const fetchReportDetails = async (id: string) => {
    if (!id || id === "undefined") {
      throw new Error("Report ID not found in URL.");
    }

    const response = await fetch(
      `${API_BASE_URL}/doctors/reports/${encodeURIComponent(String(id))}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || "Failed to load report details.");
    }

    const result: DoctorReportResponse = await response.json();
    setData(result);
  };

  const fetchDoctorNotes = async (id: string) => {
    setNotesLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/doctor-notes/reports/${encodeURIComponent(String(id))}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to load doctor notes.");
      }

      const notes: DoctorNote[] = await response.json();
      setDoctorNotes(notes);

      if (notes.length > 0) {
        const latestNote = notes[0];

        setNoteForm({
          notes: latestNote.notes || "",
          recommendations: latestNote.recommendations || "",
          follow_up: latestNote.follow_up || "",
        });
      }
    } finally {
      setNotesLoading(false);
    }
  };

  const loadPageData = async (id: string) => {
    try {
      setLoading(true);
      setErrorMessage("");

      await fetchReportDetails(id);
      await fetchDoctorNotes(id);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!reportId) return;

    loadPageData(reportId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const handleNoteChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setNoteForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveDoctorNote = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSavingNote(true);
      setNoteSuccessMessage("");
      setNoteErrorMessage("");

      if (!reportId) {
        throw new Error("Report ID not found.");
      }

      const response = await fetch(
        `${API_BASE_URL}/doctor-notes/reports/${encodeURIComponent(
          String(reportId)
        )}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(noteForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to save doctor note.");
      }

      await response.json();

      setNoteSuccessMessage("Doctor note saved successfully.");
      await fetchDoctorNotes(reportId);
    } catch (error: any) {
      setNoteErrorMessage(error.message || "Something went wrong.");
    } finally {
      setSavingNote(false);
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

  const formatDateTime = (dateValue?: string) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cleanMarkdownText = (text?: string | null) => {
    if (!text) return "";

    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#+\s?/g, "")
      .trim();
  };

  const renderParagraphText = (text?: string | null) => {
    const cleaned = cleanMarkdownText(text);

    if (!cleaned) {
      return <p className="text-slate-500">No data available.</p>;
    }

    return cleaned.split("\n").map((line, index) => {
      const value = line.trim();

      if (!value) return null;

      return (
        <p key={index} className="mb-3 leading-8 text-slate-700">
          {value}
        </p>
      );
    });
  };

  const renderListText = (text?: string | null) => {
    const cleaned = cleanMarkdownText(text);

    if (!cleaned) {
      return <p className="text-slate-500">No data available.</p>;
    }

    const lines = cleaned
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[-•]\s?/, "").replace(/^\d+\.\s?/, ""));

    return (
      <ul className="space-y-3">
        {lines.map((line, index) => (
          <li key={index} className="flex gap-3 leading-7 text-slate-700">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    );
  };

  const report = data?.report;
  const analysis = data?.analysis;

  return (
    <ProtectedRoute allowedRoles={["Doctor", "doctor"]}>
      <>
        <AppNavbar />

        <main className="min-h-screen bg-slate-50 px-6 py-8">
          <section className="mx-auto max-w-7xl">
            <button
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 shadow-xl">
              <div className="flex flex-col gap-6 px-8 py-10 text-white md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                    <ShieldCheck size={18} />
                    Secure Doctor Report View
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    Patient Report Details
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    Review uploaded medical report information, AI-powered
                    insights, and add doctor notes for clinical support.
                  </p>
                </div>

                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur">
                  <Brain size={58} />
                </div>
              </div>
            </div>

            {loading && (
              <div className="mt-8 flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="font-medium">Loading report details...</span>
                </div>
              </div>
            )}

            {!loading && errorMessage && (
              <div className="mt-8 rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} />
                  <div>
                    <h2 className="font-semibold">Unable to load report</h2>
                    <p className="mt-1 text-sm">{errorMessage}</p>
                    <button
                      onClick={() => loadPageData(reportId)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !errorMessage && report && (
              <>
                <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <FileText size={32} />
                      </div>

                      <div>
                        <h2 className="max-w-4xl text-2xl font-bold leading-snug text-slate-950">
                          {report.file_name}
                        </h2>

                        <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <UserRound size={18} />
                            Patient:{" "}
                            <span className="font-semibold text-slate-900">
                              {report.patient_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarDays size={18} />
                            Uploaded:{" "}
                            <span className="font-semibold text-slate-900">
                              {formatDate(report.uploaded_at)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                            {report.report_type}
                          </span>

                          <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                            {report.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/doctor/dashboard"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Stethoscope size={18} />
                      Dashboard
                    </Link>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <InsightCard
                    icon={<Sparkles size={26} />}
                    iconClass="bg-purple-100 text-purple-700"
                    title="AI Summary"
                    subtitle="Automated medical report interpretation."
                  >
                    {analysis?.summary ? (
                      renderParagraphText(analysis.summary)
                    ) : (
                      <p className="leading-8 text-slate-500">
                        AI analysis is not available for this report yet.
                      </p>
                    )}
                  </InsightCard>

                  <InsightCard
                    icon={<FileText size={26} />}
                    iconClass="bg-cyan-100 text-cyan-700"
                    title="Report Notes"
                    subtitle="Additional details related to this report."
                  >
                    {report.notes ? (
                      renderParagraphText(report.notes)
                    ) : (
                      <p className="leading-8 text-slate-500">
                        No notes available.
                      </p>
                    )}
                  </InsightCard>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <InsightCard
                    icon={<Sparkles size={26} />}
                    iconClass="bg-green-100 text-green-700"
                    title="Key Findings"
                    subtitle="Important insights extracted from the report."
                  >
                    {analysis?.key_findings ? (
                      renderListText(analysis.key_findings)
                    ) : (
                      <p className="leading-8 text-slate-500">
                        Key findings are not available for this report yet.
                      </p>
                    )}
                  </InsightCard>

                  <InsightCard
                    icon={<HelpCircle size={26} />}
                    iconClass="bg-amber-100 text-amber-700"
                    title="Suggested Doctor Questions"
                    subtitle="Helpful questions for consultation discussion."
                  >
                    {analysis?.doctor_questions ? (
                      renderListText(analysis.doctor_questions)
                    ) : (
                      <p className="leading-8 text-slate-500">
                        Suggested questions are not available for this report yet.
                      </p>
                    )}
                  </InsightCard>
                </div>

                <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      <ClipboardPenLine size={26} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-slate-950">
                        Doctor Notes
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Add clinical notes, recommendations, and follow-up plan
                        for this report.
                      </p>
                    </div>
                  </div>

                  {noteSuccessMessage && (
                    <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                      <CheckCircle2 size={18} />
                      {noteSuccessMessage}
                    </div>
                  )}

                  {noteErrorMessage && (
                    <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      <AlertCircle size={18} />
                      {noteErrorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSaveDoctorNote} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Clinical Notes
                      </label>
                      <textarea
                        name="notes"
                        value={noteForm.notes}
                        onChange={handleNoteChange}
                        rows={4}
                        placeholder="Example: Patient fasting blood sugar level is high..."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Recommendations
                      </label>
                      <textarea
                        name="recommendations"
                        value={noteForm.recommendations}
                        onChange={handleNoteChange}
                        rows={4}
                        placeholder="Example: Recommend HbA1c test and diet control..."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Follow-up Plan
                      </label>
                      <input
                        name="follow_up"
                        value={noteForm.follow_up}
                        onChange={handleNoteChange}
                        placeholder="Example: Review again after 2 weeks."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingNote}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingNote ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save Doctor Note
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-950">
                      Saved Notes
                    </h3>

                    {notesLoading ? (
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading saved notes...
                      </div>
                    ) : doctorNotes.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                        No doctor notes added yet.
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        {doctorNotes.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Updated {formatDateTime(note.updated_at)}
                            </p>

                            {note.notes && (
                              <div className="mt-4">
                                <p className="text-sm font-bold text-slate-800">
                                  Notes
                                </p>
                                <p className="mt-1 leading-7 text-slate-700">
                                  {note.notes}
                                </p>
                              </div>
                            )}

                            {note.recommendations && (
                              <div className="mt-4">
                                <p className="text-sm font-bold text-slate-800">
                                  Recommendations
                                </p>
                                <p className="mt-1 leading-7 text-slate-700">
                                  {note.recommendations}
                                </p>
                              </div>
                            )}

                            {note.follow_up && (
                              <div className="mt-4">
                                <p className="text-sm font-bold text-slate-800">
                                  Follow-up
                                </p>
                                <p className="mt-1 leading-7 text-slate-700">
                                  {note.follow_up}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold text-slate-950">
                      Extracted Report Text
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Raw text extracted from the uploaded medical report.
                    </p>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                    {analysis?.extracted_text ? (
                      renderParagraphText(analysis.extracted_text)
                    ) : (
                      <p className="text-slate-500">
                        Extracted text is not available for this report yet.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}

function InsightCard({
  icon,
  iconClass,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">{children}</div>
    </div>
  );
}