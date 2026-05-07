"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUserRole } from "@/lib/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();

    if (!token || !role) {
      router.push("/login");
      return;
    }

    if (!allowedRoles.includes(role)) {
      router.push("/login");
      return;
    }

    setAuthorized(true);
  }, [router, allowedRoles]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}