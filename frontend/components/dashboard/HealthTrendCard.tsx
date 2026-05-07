"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TrendKey = "glucose" | "hemoglobin" | "cholesterol";

const trendDataMap: Record<
  TrendKey,
  {
    title: string;
    status: string;
    badgeClass: string;
    points: { date: string; value: number }[];
  }
> = {
  glucose: {
    title: "Glucose",
    status: "Slightly High",
    badgeClass: "bg-red-100 text-red-700",
    points: [
      { date: "Jan", value: 92 },
      { date: "Feb", value: 98 },
      { date: "Mar", value: 110 },
      { date: "Apr", value: 126 },
      { date: "May", value: 134 },
      { date: "Jun", value: 140 },
    ],
  },
  hemoglobin: {
    title: "Hemoglobin",
    status: "Below Normal",
    badgeClass: "bg-amber-100 text-amber-700",
    points: [
      { date: "Jan", value: 13.4 },
      { date: "Feb", value: 13.1 },
      { date: "Mar", value: 12.6 },
      { date: "Apr", value: 12.1 },
      { date: "May", value: 11.6 },
      { date: "Jun", value: 11.0 },
    ],
  },
  cholesterol: {
    title: "Cholesterol",
    status: "Stable",
    badgeClass: "bg-teal-100 text-teal-700",
    points: [
      { date: "Jan", value: 178 },
      { date: "Feb", value: 182 },
      { date: "Mar", value: 176 },
      { date: "Apr", value: 181 },
      { date: "May", value: 179 },
      { date: "Jun", value: 180 },
    ],
  },
};

export default function HealthTrendCard() {
  const [selectedTest, setSelectedTest] = useState<TrendKey>("glucose");

  const selectedTrend = useMemo(() => {
    return trendDataMap[selectedTest];
  }, [selectedTest]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Health Trend Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track your recent test performance over time
          </p>
        </div>

        <select
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value as TrendKey)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
        >
          <option value="glucose">Glucose</option>
          <option value="hemoglobin">Hemoglobin</option>
          <option value="cholesterol">Cholesterol</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Test: {selectedTrend.title}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${selectedTrend.badgeClass}`}
        >
          Status: {selectedTrend.status}
        </span>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
  <div className="h-[320px] w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={selectedTrend.points}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
        <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Latest Value
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {selectedTrend.points[selectedTrend.points.length - 1].value}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Trend Direction
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {selectedTrend.points[selectedTrend.points.length - 1].value >
            selectedTrend.points[0].value
              ? "Increasing"
              : "Decreasing"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Last Updated
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900">Jun 2026</p>
        </div>
      </div>
    </div>
  );
}