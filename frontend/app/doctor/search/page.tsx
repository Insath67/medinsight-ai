"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type SearchType = "doctor-requests" | "consultations" | "reports";

type SearchResult = {
  id?: string;
  report_id?: string;
  consultation_id?: string;
  patient_id?: string;
  patient_name?: string;
  doctor_name?: string;
  file_name?: string;
  filename?: string;
  report_name?: string;
  report_type?: string;
  patient_message?: string;
  status?: string;
  uploaded_at?: string;
  created_at?: string;
};

export default function DoctorSearchPage() {
  const [searchType, setSearchType] = useState<SearchType>("doctor-requests");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [reportType, setReportType] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

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

  const buildSearchUrl = () => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.append("q", query.trim());
    }

    params.append("limit", "20");
    params.append("offset", "0");
    params.append("sort_order", "desc");

    if (status.trim()) {
      params.append("status", status.trim());
    }

    if (searchType === "reports") {
      params.append("sort_by", "uploaded_at");

      if (reportType.trim()) {
        params.append("report_type", reportType.trim());
      }

      return `${API_BASE_URL}/search/reports?${params.toString()}`;
    }

    if (searchType === "consultations") {
      return `${API_BASE_URL}/search/consultations?${params.toString()}`;
    }

    return `${API_BASE_URL}/search/doctor-requests?${params.toString()}`;
  };

  const normalizeResults = (data: any): SearchResult[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.doctor_requests)) return data.doctor_requests;
    if (Array.isArray(data?.consultations)) return data.consultations;
    if (Array.isArray(data?.reports)) return data.reports;
    return [];
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setHasSearched(true);

      const response = await fetch(buildSearchUrl(), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Search failed.");
      }

      setResults(normalizeResults(data));
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setStatus("");
    setReportType("");
    setResults([]);
    setHasSearched(false);
    setErrorMessage("");
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

  const getResultId = (item: SearchResult) => {
    return String(item.id || item.report_id || item.consultation_id || "");
  };

  const getIcon = () => {
    if (searchType === "reports") return <FileText size={24} />;
    if (searchType === "consultations") return <MessageSquareText size={24} />;
    return <UserRound size={24} />;
  };

  const getTitle = (item: SearchResult) => {
    if (searchType === "reports") {
      return item.file_name || item.filename || item.report_name || "Medical Report";
    }

    return item.patient_name || "Patient Request";
  };

  const getDescription = (item: SearchResult) => {
    if (searchType === "reports") {
      return `Type: ${item.report_type || "N/A"} • Status: ${
        item.status || "Uploaded"
      }`;
    }

    return item.patient_message || `Status: ${item.status || "N/A"}`;
  };

  const handleOpenResult = (item: SearchResult) => {
    const id = getResultId(item);

    if (searchType === "reports" && id) {
      window.location.href = `/doctor/reports/${id}`;
      return;
    }

    window.location.href = "/doctor/consultations";
  };

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
                    Doctor Search Center
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    Search
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    Search patient requests, consultations, and reports quickly.
                  </p>
                </div>

                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur">
                  <Search size={58} />
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <form onSubmit={handleSearch} className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Search Type
                    </label>

                    <select
                      value={searchType}
                      onChange={(e) => {
                        setSearchType(e.target.value as SearchType);
                        setResults([]);
                        setHasSearched(false);
                        setErrorMessage("");
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                    >
                      <option value="doctor-requests">Doctor Requests</option>
                      <option value="consultations">Consultations</option>
                      <option value="reports">Reports</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Search Keyword
                    </label>

                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by patient, report, message..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Status
                    </label>

                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                    >
                      <option value="">All statuses</option>
                      <option value="pending_doctor_acceptance">Pending</option>
                      <option value="active">Active</option>
                      <option value="declined">Declined</option>
                      <option value="Uploaded">Uploaded</option>
                    </select>
                  </div>

                  {searchType === "reports" && (
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Report Type
                      </label>

                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                      >
                        <option value="">All report types</option>
                        <option value="Blood Test">Blood Test</option>
                        <option value="X-Ray">X-Ray</option>
                        <option value="MRI">MRI</option>
                        <option value="CT Scan">CT Scan</option>
                        <option value="Urine Test">Urine Test</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw size={17} />
                    Clear
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Search Results
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {hasSearched
                    ? `${results.length} result(s) found.`
                    : "Search results will appear here."}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  <AlertCircle size={18} />
                  {errorMessage}
                </div>
              )}

              {loading && (
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-medium">Searching...</span>
                  </div>
                </div>
              )}

              {!loading && !errorMessage && !hasSearched && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <Search className="mx-auto text-slate-400" size={42} />
                  <h3 className="mt-4 text-lg font-bold text-slate-800">
                    Start searching
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Enter a keyword and choose what you want to search.
                  </p>
                </div>
              )}

              {!loading &&
                !errorMessage &&
                hasSearched &&
                results.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <AlertCircle className="mx-auto text-slate-400" size={42} />
                    <h3 className="mt-4 text-lg font-bold text-slate-800">
                      No results found
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Try another keyword or filter.
                    </p>
                  </div>
                )}

              {!loading && !errorMessage && results.length > 0 && (
                <div className="space-y-4">
                  {results.map((item, index) => (
                    <div
                      key={getResultId(item) || index}
                      className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-blue-300 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            {getIcon()}
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-slate-950">
                              {getTitle(item)}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                              <span className="inline-flex items-center gap-2">
                                <CalendarDays size={16} />
                                {formatDate(item.uploaded_at || item.created_at)}
                              </span>

                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                {item.status || "N/A"}
                              </span>
                            </div>

                            <p className="mt-4 max-w-3xl rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700">
                              {getDescription(item)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenResult(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                          <CheckCircle2 size={17} />
                          Open
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}