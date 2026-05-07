"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  FileText,
  HeartPulse,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UploadCloud,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
              <Activity size={26} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-950">
                MedInsight AI
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Smart medical report assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              <ShieldCheck size={17} />
              Secure AI-Powered Healthcare Platform
            </div>

            <h2 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-6xl">
              Smart Medical Report Analysis for Patients and Doctors
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              MedInsight AI helps patients upload medical reports, understand AI
              summaries, compare health results, request doctor consultations,
              receive doctor notes, and manage health updates in one secure
              platform.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-base font-bold text-white shadow-lg transition hover:bg-blue-700"
              >
                Start Now
                <ArrowRight size={19} />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Login to Dashboard
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "AI report summaries",
                "Doctor consultations",
                "Secure notifications",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  <CheckCircle2 size={18} className="text-green-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
            <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-500 p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                  <Brain size={18} />
                  AI Insight Preview
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <HeartPulse size={34} />
                </div>
              </div>

              <h3 className="mt-8 text-3xl font-extrabold">
                Report analyzed successfully
              </h3>

              <p className="mt-3 text-sm leading-7 text-blue-50">
                Your recent lab report shows important findings and possible
                follow-up actions. Consult your doctor for professional medical
                advice.
              </p>

              <div className="mt-7 grid gap-4">
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm text-blue-50">Detected Report Type</p>
                  <p className="mt-1 text-xl font-bold">Blood Test</p>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm text-blue-50">AI Summary</p>
                  <p className="mt-1 text-xl font-bold">
                    Key findings generated
                  </p>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm text-blue-50">Doctor Support</p>
                  <p className="mt-1 text-xl font-bold">
                    Consultation available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
            <Sparkles size={17} />
            Core Features
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            Everything needed for smarter medical report management
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            A complete workflow for patients and doctors, from report upload to
            AI analysis, consultation, feedback, and notifications.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard
            icon={<UploadCloud size={28} />}
            title="Upload Reports"
            description="Patients can securely upload PDF or image-based medical reports."
          />

          <FeatureCard
            icon={<Brain size={28} />}
            title="AI Analysis"
            description="AI extracts report insights, summaries, key findings, and doctor questions."
          />

          <FeatureCard
            icon={<MessageSquareText size={28} />}
            title="Consultations"
            description="Patients can request consultations and doctors can accept or decline requests."
          />

          <FeatureCard
            icon={<Bot size={28} />}
            title="AI Doctor Chat"
            description="Patients can ask health-related questions using the AI doctor assistant."
          />
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-[34px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-700">
                <Stethoscope size={17} />
                System Workflow
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                Built for patient-doctor interaction
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-600">
                The platform connects patients and doctors through a simple
                workflow: upload reports, analyze results, request consultation,
                doctor reviews report, adds notes, and patient receives updates.
              </p>

              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Continue to Login
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "1. Patient Uploads",
                  text: "Patient uploads medical report with report type and notes.",
                  icon: <UploadCloud size={22} />,
                },
                {
                  title: "2. AI Reviews",
                  text: "System generates AI summary and extracts important findings.",
                  icon: <Brain size={22} />,
                },
                {
                  title: "3. Doctor Consults",
                  text: "Doctor reviews patient report and adds clinical notes.",
                  icon: <Stethoscope size={22} />,
                },
                {
                  title: "4. Patient Tracks",
                  text: "Patient views notes, notifications, feedback, and status.",
                  icon: <FileText size={22} />,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <RoleCard
            title="Patient"
            description="Upload reports, view AI analysis, request consultations, view doctor notes, use AI chat, search data, and receive notifications."
            href="/login"
            buttonText="Patient Login"
          />

          <RoleCard
            title="Doctor"
            description="View patient reports, accept consultation requests, add doctor notes, review feedback, search requests, and receive notifications."
            href="/login"
            buttonText="Doctor Login"
          />

          <RoleCard
            title="Admin"
            description="Manage users, review doctor approval requests, monitor platform activity, and support system control."
            href="/login"
            buttonText="Admin Login"
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-slate-950">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function RoleCard({
  title,
  description,
  href,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <h3 className="text-2xl font-extrabold text-slate-950">{title}</h3>

      <p className="mt-3 min-h-[112px] text-sm leading-7 text-slate-600">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
      >
        {buttonText}
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}