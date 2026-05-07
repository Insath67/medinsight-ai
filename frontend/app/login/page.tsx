"use client";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-xl items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}