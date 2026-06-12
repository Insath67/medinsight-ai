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
  pending?: boolean;
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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.detail || data?.message || "Failed to load chat history.";

        if (
          message.toLowerCase().includes("no lab history") ||
          message.toLowerCase().includes("no chat history") ||
          message.toLowerCase().includes("not found")
        ) {
          setChatHistory([]);
          return;
        }

        throw new Error(message);
      }

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
  }, [chatHistory, sending]);

  const getAnswer = (item: ChatItem) => {
    return (
      item.answer ||
      item.response ||
      item.ai_response ||
      item.message ||
      "No AI response available."
    );
  };

  const formatDateTime = (dateValue?: string) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentQuestion = question.trim();

    try {
      setSending(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!currentQuestion) {
        throw new Error("Please enter your question.");
      }

      const tempId = crypto.randomUUID();

      const pendingChat: ChatItem = {
        id: tempId,
        question: currentQuestion,
        answer: "",
        created_at: new Date().toISOString(),
        pending: true,
      };

      setChatHistory((prev) => [...prev, pendingChat]);
      setQuestion("");

      const response = await fetch(`${API_BASE_URL}/chat/ask`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          question: currentQuestion,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to ask AI doctor.");
      }

      const updatedChat: ChatItem = {
        id: data?.id || tempId,
        question: data?.question || currentQuestion,
        answer:
          data?.answer ||
          data?.response ||
          data?.ai_response ||
          data?.message ||
          "AI response generated.",
        created_at: data?.created_at || new Date().toISOString(),
        pending: false,
      };

      setChatHistory((prev) =>
        prev.map((item) => (item.id === tempId ? updatedChat : item))
      );

      setSuccessMessage("AI response generated successfully.");
    } catch (error: any) {
      setChatHistory((prev) =>
        prev.map((item) =>
          item.pending
            ? {
                ...item,
                pending: false,
                answer:
                  "Sorry, I could not generate a response right now. Please try again.",
              }
            : item
        )
      );

      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setQuestion(sample);
  };

  return (
    <ProtectedRoute allowedRoles={["Patient", "patient"]}>
      <>
        <AppNavbar />

        <main className="min-h-screen bg-[#efeae2] px-4 py-6 md:px-6 md:py-8">
          <section className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 shadow-xl">
              <div className="flex flex-col gap-6 px-6 py-8 text-white md:flex-row md:items-center md:justify-between md:px-8 md:py-10">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                    <ShieldCheck size={18} />
                    AI Doctor Assistant
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    AI Doctor Chat
                  </h1>

                  <p className="mt-3 max-w-2xl text-base text-blue-50">
                    Ask health-related questions and get AI-powered guidance in
                    a simple chat format.
                  </p>
                </div>

                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur md:h-28 md:w-28">
                  <Brain size={54} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Bot size={24} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        MedInsight AI
                      </h2>
                      <p className="text-sm text-slate-500">
                        Online • Medical guidance assistant
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={fetchChatHistory}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>

                {successMessage && (
                  <div className="mx-5 mt-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                    <CheckCircle2 size={18} />
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="mx-5 mt-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    <AlertCircle size={18} />
                    {errorMessage}
                  </div>
                )}

                <div className="min-h-[560px] bg-[#efeae2] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)] [background-size:22px_22px]">
                  {loadingHistory ? (
                    <div className="flex min-h-[560px] items-center justify-center">
                      <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-5 py-4 text-slate-600 shadow-sm">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="font-medium">
                          Loading chat history...
                        </span>
                      </div>
                    </div>
                  ) : chatHistory.length === 0 ? (
                    <div className="flex min-h-[560px] flex-col items-center justify-center p-8 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                        <Bot size={34} />
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-slate-800">
                        No chat history yet
                      </h3>

                      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                        Ask your first question below. Your question will appear
                        on the right, and the AI answer will appear below it.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[620px] space-y-5 overflow-y-auto px-4 py-6 md:px-6">
                      {chatHistory.map((item, index) => (
                        <div key={item.id || index} className="space-y-3">
                          <div className="flex justify-end">
                            <div className="relative max-w-[82%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-4 py-3 text-slate-900 shadow-sm">
                              <div className="mb-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-green-700">
                                <UserRound size={13} />
                                You
                              </div>

                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {item.question || "No question available."}
                              </p>

                              <div className="mt-2 text-right text-[11px] text-slate-500">
                                {formatDateTime(item.created_at)}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-start">
                            <div className="relative max-w-[82%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-slate-900 shadow-sm">
                              <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                                <Bot size={13} />
                                MedInsight AI
                              </div>

                              {item.pending ? (
                                <div className="flex items-center gap-2 py-1 text-sm text-slate-500">
                                  <Loader2
                                    className="animate-spin text-blue-600"
                                    size={16}
                                  />
                                  AI is typing...
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap text-sm leading-6">
                                  {getAnswer(item)}
                                </p>
                              )}

                              <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                                <CalendarDays size={12} />
                                {formatDateTime(item.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleAskQuestion}
                  className="border-t border-slate-200 bg-white p-4"
                >
                  <div className="flex gap-3">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={2}
                      placeholder="Type your question..."
                      className="min-h-[56px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                    />

                    <button
                      type="submit"
                      disabled={sending}
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Send message"
                    >
                      {sending ? (
                        <Loader2 className="animate-spin" size={22} />
                      ) : (
                        <Send size={22} />
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
                        onClick={() => handleSampleClick(sample)}
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