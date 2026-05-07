"use client";

import React, { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppNavbar from "@/components/layout/AppNavbar";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  AlertCircle,
  Bot,
  Brain,
  CalendarDays,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

type ChatItem = {
  id?: string;
  question?: string;
  answer?: string;
  response?: string;
  ai_response?: string;
  message?: string;
  created_at?: string;
};

export default function PatientAIChatPage() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

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

  const fetchChatHistory = async () => {
    try {
      setLoadingHistory(true);
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to load chat history.");
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.history || data.chats || data.data || data.items || [];

      setChatHistory(Array.isArray(list) ? list : []);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSending(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!question.trim()) {
        throw new Error("Please enter your question.");
      }

      const response = await fetch(`${API_BASE_URL}/chat/ask`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to ask AI doctor.");
      }

      setSuccessMessage("AI response generated successfully.");
      setQuestion("");

      const newChatItem: ChatItem = {
        id: data?.id || crypto.randomUUID(),
        question: data?.question || question.trim(),
        answer:
          data?.answer ||
          data?.response ||
          data?.ai_response ||
          data?.message ||
          "AI response generated.",
        created_at: data?.created_at || new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, newChatItem]);

      await fetchChatHistory();
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
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

  const getAnswer = (item: ChatItem) => {
    return (
      item.answer ||
      item.response ||
      item.ai_response ||
      item.message ||
      "No AI response available."
    );
  };

  return (
    <ProtectedRoute allowedRoles={["Patient", "patient"]}>
      <>
        <AppNavbar />

        <main className="min-h-screen bg-slate-50 px-6 py-8">
          <section className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 shadow-xl">
              <div className="flex flex-col gap-6 px-8 py-10 text-white md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                    <ShieldCheck size={18} />
                    AI Doctor Assistant
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight">
                    AI Doctor Chat
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    Ask health-related questions and get AI-powered guidance
                    based on medical context.
                  </p>
                </div>

                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur">
                  <Brain size={58} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Chat Conversation
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Your previous questions and AI responses appear here.
                    </p>
                  </div>

                  <button
                    onClick={fetchChatHistory}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
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

                {loadingHistory ? (
                  <div className="flex min-h-[360px] items-center justify-center">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="font-medium">
                        Loading chat history...
                      </span>
                    </div>
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <Bot className="text-slate-400" size={48} />
                    <h3 className="mt-4 text-lg font-bold text-slate-800">
                      No chat history yet
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Ask your first question below. Example: “What does high
                      fasting blood sugar mean?”
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[620px] space-y-6 overflow-y-auto pr-2">
                    {chatHistory.map((item, index) => (
                      <div key={item.id || index} className="space-y-4">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] rounded-[24px] bg-blue-600 px-5 py-4 text-white shadow-sm">
                            <div className="mb-2 flex items-center justify-end gap-2 text-xs text-blue-100">
                              <UserRound size={14} />
                              You
                            </div>
                            <p className="text-sm leading-7">
                              {item.question || "No question available."}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm">
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-700">
                              <Bot size={15} />
                              MedInsight AI
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-7">
                              {getAnswer(item)}
                            </p>

                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                              <CalendarDays size={14} />
                              {formatDateTime(item.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div ref={bottomRef} />
                  </div>
                )}

                <form
                  onSubmit={handleAskQuestion}
                  className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Ask AI Doctor
                  </label>

                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={4}
                    placeholder="Example: What does high fasting blood sugar mean?"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-blue-400"
                  />

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Asking...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Ask AI Doctor
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                      <Sparkles size={24} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Ask Examples
                      </h3>
                      <p className="text-sm text-slate-500">
                        Try questions like these.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      "What does high fasting blood sugar mean?",
                      "How can I prepare for a blood test?",
                      "What questions should I ask my doctor?",
                      "What lifestyle changes help improve cholesterol?",
                    ].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => setQuestion(sample)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm leading-6 text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-amber-900">
                    Medical Disclaimer
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-amber-800">
                    AI responses are for general guidance only and should not
                    replace professional medical advice. Always consult a
                    qualified doctor for diagnosis and treatment.
                  </p>
                </div>
              </aside>
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}