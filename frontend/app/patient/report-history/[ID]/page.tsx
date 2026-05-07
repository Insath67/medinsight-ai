"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  FileText,
  CalendarDays,
  ShieldCheck,
  Brain,
  ArrowLeft,
  BadgeInfo,
  Sparkles,
  HelpCircle,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ClipboardPenLine,
} from "lucide-react";

type ReportDetails = {
  id?: string | number;
  report_id?: string | number;
  file_name?: string;
  filename?: string;
  report_type?: string;
  type?: string;
  uploaded_at?: string;
  created_at?: string;
  status?: string;
  notes?: string;
  description?: string;
};

type AnalysisResponse = {
  id?: string;
  report_id?: string;
  extracted_text?: string;
  summary?: string;
  key_findings?: string;
  doctor_questions?: string;
};

type LabResultItem = {
  id?: string;
  test_name?: string;
  test_value?: number;
  normal_range?: string;
  status?: string;
  clinical_interpretation?: {
    test_name?: string;
    value?: number;
    normal_range?: string;
    status?: string;
    severity?: string;
    interpretation?: string;
    recommended_action?: string;
  };
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

function ReportDetailsContent() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const reportId = useMemo(() => {
    const fromParams = params?.id;
    if (Array.isArray(fromParams) && fromParams[0]) return String(fromParams[0]);
    if (typeof fromParams === "string" && fromParams.trim() !== "") return fromParams;

    const parts = pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }, [params, pathname]);

  const [report, setReport] = useState<ReportDetails | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState("");
  const [analysisKeyFindings, setAnalysisKeyFindings] = useState("");
  const [analysisDoctorQuestions, setAnalysisDoctorQuestions] = useState("");
  const [labResults, setLabResults] = useState<LabResultItem[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>([]);

  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [labLoading, setLabLoading] = useState(false);
  const [doctorNotesLoading, setDoctorNotesLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAnalysis = async (token: string, currentReportId: string) => {
    const analysisResponse = await fetch(
      `${API_BASE_URL}/reports/analysis/${currentReportId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType = analysisResponse.headers.get("content-type") || "";
    const analysisData: AnalysisResponse = contentType.includes("application/json")
      ? await analysisResponse.json()
      : {};

    if (!analysisResponse.ok) {
      throw new Error(
        typeof (analysisData as any)?.detail === "string"
          ? (analysisData as any).detail
          : "Analysis not found"
      );
    }

    setAnalysisSummary(analysisData.summary || "");
    setAnalysisKeyFindings(analysisData.key_findings || "");
    setAnalysisDoctorQuestions(analysisData.doctor_questions || "");
  };

  const generateAnalysis = async (token: string, currentReportId: string) => {
    setAnalysisLoading(true);

    const analyzeResponse = await fetch(
      `${API_BASE_URL}/reports/analyze/${currentReportId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const contentType = analyzeResponse.headers.get("content-type") || "";
    const analyzeData = contentType.includes("application/json")
      ? await analyzeResponse.json()
      : {};

    if (!analyzeResponse.ok) {
      throw new Error(
        typeof analyzeData?.detail === "string"
          ? analyzeData.detail
          : "Failed to generate AI analysis"
      );
    }

    await fetchAnalysis(token, currentReportId);
    setAnalysisLoading(false);
  };

  const fetchLabResults = async (token: string, currentReportId: string) => {
    setLabLoading(true);

    const labResultsResponse = await fetch(
      `${API_BASE_URL}/reports/lab-results/${currentReportId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType = labResultsResponse.headers.get("content-type") || "";
    const labData = contentType.includes("application/json")
      ? await labResultsResponse.json()
      : {};

    if (!labResultsResponse.ok) {
      throw new Error(
        typeof labData?.detail === "string"
          ? labData.detail
          : "Lab results not found"
      );
    }

    setLabResults(Array.isArray(labData.lab_results) ? labData.lab_results : []);
    setLabLoading(false);
  };

  const detectLabValues = async (token: string, currentReportId: string) => {
    setLabLoading(true);

    const detectResponse = await fetch(
      `${API_BASE_URL}/reports/detect-values/${currentReportId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const contentType = detectResponse.headers.get("content-type") || "";
    const detectData = contentType.includes("application/json")
      ? await detectResponse.json()
      : {};

    if (!detectResponse.ok) {
      throw new Error(
        typeof detectData?.detail === "string"
          ? detectData.detail
          : "Failed to detect lab values"
      );
    }

    await fetchLabResults(token, currentReportId);
    setLabLoading(false);
  };

  const fetchDoctorNotes = async (token: string, currentReportId: string) => {
    try {
      setDoctorNotesLoading(true);

      const notesResponse = await fetch(
        `${API_BASE_URL}/doctor-notes/reports/${currentReportId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = notesResponse.headers.get("content-type") || "";
      const notesData = contentType.includes("application/json")
        ? await notesResponse.json()
        : [];

      if (!notesResponse.ok) {
        setDoctorNotes([]);
        return;
      }

      setDoctorNotes(Array.isArray(notesData) ? notesData : []);
    } catch {
      setDoctorNotes([]);
    } finally {
      setDoctorNotesLoading(false);
    }
  };

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        if (!reportId) {
          setErrorMessage("Invalid report ID");
          return;
        }

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const reportResponse = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const reportDataRaw = await reportResponse.json();

        if (!reportResponse.ok) {
          throw new Error(
            typeof reportDataRaw.detail === "string"
              ? reportDataRaw.detail
              : JSON.stringify(reportDataRaw.detail || "Failed to load report details")
          );
        }

        const reportData = reportDataRaw.data || reportDataRaw.report || reportDataRaw;
        setReport(reportData);

        await fetchDoctorNotes(token, String(reportId));

        try {
          await fetchAnalysis(token, String(reportId));
        } catch {
          try {
            await generateAnalysis(token, String(reportId));
          } catch {
            setAnalysisSummary("");
            setAnalysisKeyFindings("");
            setAnalysisDoctorQuestions("");
          }
        }

        try {
          await fetchLabResults(token, String(reportId));

          const labResultsResponse = await fetch(
            `${API_BASE_URL}/reports/lab-results/${reportId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const labData = await labResultsResponse.json();
          const existingResults = Array.isArray(labData.lab_results)
            ? labData.lab_results
            : [];

          if (existingResults.length === 0) {
            await detectLabValues(token, String(reportId));
          }
        } catch {
          try {
            await detectLabValues(token, String(reportId));
          } catch {
            setLabResults([]);
          }
        }
      } catch (error: any) {
        setErrorMessage(error.message || "Something went wrong");
      } finally {
        setLoading(false);
        setAnalysisLoading(false);
        setLabLoading(false);
        setDoctorNotesLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId, router]);

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateValue?: string) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status?: string) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "HIGH") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (normalized === "LOW") {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }

    if (normalized === "NORMAL") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }

    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getSeverityStyle = (severity?: string) => {
    const normalized = String(severity || "").toLowerCase();

    if (normalized === "high" || normalized === "severe") {
      return "bg-red-100 text-red-700";
    }

    if (normalized === "moderate") {
      return "bg-amber-100 text-amber-700";
    }

    if (normalized === "low" || normalized === "mild") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const reportName = report?.file_name || report?.filename || "Unnamed Report";
  const reportType = report?.report_type || report?.type || "N/A";
  const reportDate = formatDate(report?.uploaded_at || report?.created_at);
  const reportNotes = report?.notes || report?.description || "No notes available.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 px-8 py-8 text-white">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Report Details
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                  Report Details
                </h1>

                <p className="mt-3 max-w-2xl text-sm text-blue-50 md:text-base">
                  View uploaded report information, AI-powered medical insights,
                  and doctor recommendations.
                </p>
              </div>

              <div className="hidden rounded-3xl bg-white/10 p-5 backdrop-blur-sm md:block">
                <Brain className="h-14 w-14 text-white" />
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 text-center text-slate-600">
                Loading report details...
              </div>
            ) : errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            ) : !report ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 text-center text-slate-600">
                Report not found.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-blue-100 p-3">
                      <FileText className="h-5 w-5 text-blue-700" />
                    </div>

                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {reportName}
                      </h2>

                      <p className="mt-2 text-sm text-slate-600">
                        Type: {reportType}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>Uploaded: {reportDate}</span>
                      </div>

                      <div className="mt-3 inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                        {report.status || "Uploaded"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-2xl bg-cyan-100 p-3">
                        <BadgeInfo className="h-5 w-5 text-cyan-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Notes
                        </h3>
                        <p className="text-sm text-slate-600">
                          Additional details related to this report.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                      {reportNotes}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-2xl bg-violet-100 p-3">
                        <Sparkles className="h-5 w-5 text-violet-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          AI Summary
                        </h3>
                        <p className="text-sm text-slate-600">
                          Automated summary and interpretation for this report.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 whitespace-pre-wrap text-slate-700">
                      {analysisLoading
                        ? "Generating AI analysis..."
                        : analysisSummary || "AI analysis is not available for this report yet."}
                    </div>
                  </div>
                </div>

                {(analysisKeyFindings || analysisDoctorQuestions || analysisLoading) && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-100 p-3">
                          <Sparkles className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            Key Findings
                          </h3>
                          <p className="text-sm text-slate-600">
                            Important insights extracted from the report.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 whitespace-pre-wrap text-slate-700">
                        {analysisLoading
                          ? "Generating key findings..."
                          : analysisKeyFindings || "No key findings available."}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-2xl bg-amber-100 p-3">
                          <HelpCircle className="h-5 w-5 text-amber-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            Suggested Doctor Questions
                          </h3>
                          <p className="text-sm text-slate-600">
                            Helpful questions to ask during consultation.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 whitespace-pre-wrap text-slate-700">
                        {analysisLoading
                          ? "Generating doctor questions..."
                          : analysisDoctorQuestions || "No suggested doctor questions available."}
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-100 p-3">
                      <ClipboardPenLine className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Doctor Notes & Recommendations
                      </h3>
                      <p className="text-sm text-slate-600">
                        Notes and follow-up advice added by your doctor for this report.
                      </p>
                    </div>
                  </div>

                  {doctorNotesLoading ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      Loading doctor notes...
                    </div>
                  ) : doctorNotes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                      No doctor notes have been added for this report yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {doctorNotes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-semibold text-slate-900">
                              Doctor Note
                            </p>
                            <p className="text-xs text-slate-500">
                              Updated: {formatDateTime(note.updated_at || note.created_at)}
                            </p>
                          </div>

                          {note.notes && (
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Clinical Notes
                              </p>
                              <p className="mt-2 text-sm leading-7 text-slate-700">
                                {note.notes}
                              </p>
                            </div>
                          )}

                          {note.recommendations && (
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Recommendations
                              </p>
                              <p className="mt-2 text-sm leading-7 text-slate-700">
                                {note.recommendations}
                              </p>
                            </div>
                          )}

                          {note.follow_up && (
                            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                Follow-up Plan
                              </p>
                              <p className="mt-2 text-sm leading-7 text-blue-900">
                                {note.follow_up}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-100 p-3">
                      <Activity className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Detected Lab Values
                      </h3>
                      <p className="text-sm text-slate-600">
                        AI extracted values with automatic abnormality detection.
                      </p>
                    </div>
                  </div>

                  {labLoading ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      Detecting lab values...
                    </div>
                  ) : labResults.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      No lab values detected for this report.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {labResults.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-slate-900">
                                {item.test_name || "Unknown Test"}
                              </h4>

                              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl bg-white px-4 py-3 border border-slate-200">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Value
                                  </p>
                                  <p className="mt-1 text-lg font-bold text-slate-900">
                                    {item.test_value ?? "N/A"}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-white px-4 py-3 border border-slate-200">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Normal Range
                                  </p>
                                  <p className="mt-1 text-lg font-bold text-slate-900">
                                    {item.normal_range || "N/A"}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-white px-4 py-3 border border-slate-200">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                  </p>
                                  <div
                                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                      item.status
                                    )}`}
                                  >
                                    {item.status || "UNKNOWN"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {String(item.status || "").toUpperCase() === "NORMAL" ? (
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Normal
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                                  <AlertTriangle className="h-4 w-4" />
                                  Needs Attention
                                </div>
                              )}
                            </div>
                          </div>

                          {item.clinical_interpretation && (
                            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-blue-600" />
                                  <p className="text-sm font-semibold text-slate-900">
                                    Clinical Interpretation
                                  </p>
                                </div>
                                <p className="mt-3 text-sm leading-7 text-slate-700">
                                  {item.clinical_interpretation.interpretation ||
                                    "No interpretation available."}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-slate-900">
                                    Recommended Action
                                  </p>
                                  <div
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSeverityStyle(
                                      item.clinical_interpretation.severity
                                    )}`}
                                  >
                                    {item.clinical_interpretation.severity || "unknown"}
                                  </div>
                                </div>
                                <p className="mt-3 text-sm leading-7 text-slate-700">
                                  {item.clinical_interpretation.recommended_action ||
                                    "No recommendation available."}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => router.push("/patient/report-history")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Report History
              </button>

              <button
                onClick={() => router.push("/patient/dashboard")}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={["patient", "Patient"]}>
      <ReportDetailsContent />
    </ProtectedRoute>
  );
}