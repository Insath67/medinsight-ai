"use client";

import React from "react";
import {
  Activity,
  Brain,
  FileText,
  HeartPulse,
  Mail,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from "lucide-react";

export default function AppFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
                <Activity size={26} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
                  MedInsight AI
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Smart medical report assistant
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
              A secure AI-powered healthcare platform for medical report
              analysis, patient-doctor consultations, doctor verification, and
              smart health insights.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              <ShieldCheck size={17} />
              Secure healthcare workflow
            </div>
          </div>

          {/* Platform Highlights */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-950">
              Platform Highlights
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <FooterFeature icon={<FileText size={16} />} text="Medical report upload" />
              <FooterFeature icon={<Brain size={16} />} text="AI-powered analysis" />
              <FooterFeature icon={<Stethoscope size={16} />} text="Doctor consultation support" />
              <FooterFeature icon={<UserCheck size={16} />} text="Verified doctor access" />
              <FooterFeature icon={<HeartPulse size={16} />} text="Health insight tracking" />
            </div>
          </div>

          {/* Trust & Support */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-950">
              Trust & Support
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Mail size={16} />
                medinsight.support
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm leading-7 text-slate-600">
                  AI insights are for guidance only. Always consult a qualified
                  doctor for diagnosis, treatment, and medical decisions.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Email verification
                </span>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                  Role-based access
                </span>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                  Admin controlled
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} MedInsight AI. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-4">
            <span>Privacy-focused design</span>
            <span>Secure authentication</span>
            <span>Medical data protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterFeature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
      <span className="text-blue-600">{icon}</span>
      {text}
    </div>
  );
}