"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { clearAuth, getToken, getUser } from "@/lib/auth";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  UploadCloud,
  UserRound,
  Users,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NotificationItem = {
  id?: string;
  notification_id?: string;
  is_read?: boolean;
  read?: boolean;
};

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const [unreadCount, setUnreadCount] = useState(0);

  const role = String(user?.role || "").toLowerCase();

  const homeHref =
    role === "doctor"
      ? "/doctor/dashboard"
      : role === "admin"
      ? "/admin/dashboard"
      : "/patient/dashboard";

  const notificationHref =
    role === "doctor"
      ? "/doctor/notifications"
      : role === "admin"
      ? "/admin/dashboard"
      : "/patient/notifications";

  const navItems = useMemo<NavItem[]>(() => {
    if (role === "doctor") {
      return [
        {
          label: "Dashboard",
          href: "/doctor/dashboard",
          icon: <LayoutDashboard size={17} />,
        },
        {
          label: "Consultations",
          href: "/doctor/consultations",
          icon: <MessageSquareText size={17} />,
        },
        {
          label: "Feedback",
          href: "/doctor/feedback",
          icon: <Star size={17} />,
        },
        {
          label: "Search",
          href: "/doctor/search",
          icon: <Search size={17} />,
        },
      ];
    }

    if (role === "admin") {
      return [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: <LayoutDashboard size={17} />,
        },
        {
          label: "Doctor Approvals",
          href: "/admin/doctor-approvals",
          icon: <CheckCircle2 size={17} />,
        },
        {
          label: "Reports",
          href: "/admin/reports",
          icon: <FileText size={17} />,
        },
        {
          label: "Users",
          href: "/admin/users",
          icon: <Users size={17} />,
        },
      ];
    }

    return [
      {
        label: "Dashboard",
        href: "/patient/dashboard",
        icon: <LayoutDashboard size={17} />,
      },
      {
        label: "Upload",
        href: "/patient/upload-report",
        icon: <UploadCloud size={17} />,
      },
      {
        label: "History",
        href: "/patient/report-history",
        icon: <History size={17} />,
      },
      {
        label: "Compare",
        href: "/patient/compare-reports",
        icon: <BarChart3 size={17} />,
      },
      {
        label: "Consultations",
        href: "/patient/consultations",
        icon: <MessageSquareText size={17} />,
      },
      {
        label: "AI Chat",
        href: "/patient/ai-chat",
        icon: <Bot size={17} />,
      },
      {
        label: "Search",
        href: "/patient/search",
        icon: <Search size={17} />,
      },
    ];
  }, [role]);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        if (role === "admin") {
          setUnreadCount(0);
          return;
        }

        const token = getToken();

        if (!token) {
          setUnreadCount(0);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/notifications/my`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setUnreadCount(0);
          return;
        }

        const data = await response.json();

        const list: NotificationItem[] = Array.isArray(data)
          ? data
          : data.notifications || data.data || data.items || [];

        if (!Array.isArray(list)) {
          setUnreadCount(0);
          return;
        }

        const unread = list.filter((item) => {
          return !Boolean(item.is_read || item.read);
        }).length;

        setUnreadCount(unread);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnreadNotifications();
  }, [pathname, role]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const roleBadge =
    role === "doctor"
      ? {
          label: "Doctor",
          icon: <Stethoscope size={16} />,
          className: "bg-cyan-50 text-cyan-700 border-cyan-200",
        }
      : role === "admin"
      ? {
          label: "Admin",
          icon: <ShieldCheck size={16} />,
          className: "bg-violet-50 text-violet-700 border-violet-200",
        }
      : {
          label: "Patient",
          icon: <UserRound size={16} />,
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5">
        <Link href={homeHref} className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
              <Activity size={23} />
            </div>

            <div className="hidden xl:block">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-950">
                MedInsight AI
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Smart medical report assistant
              </p>
            </div>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center">
          <div className="flex items-center gap-1 overflow-x-auto rounded-2xl px-1 py-1 scrollbar-hide">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {role !== "admin" && (
            <Link
              href={notificationHref}
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                pathname === notificationHref
                  ? "border-blue-200 bg-blue-600 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
              title="Notifications"
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          <div
            className={`hidden items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold md:inline-flex ${roleBadge.className}`}
          >
            {roleBadge.icon}
            {roleBadge.label}
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}