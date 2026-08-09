"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCalendarDate, localDateString, parseCalendarDate } from "@/lib/date";
import type { DailyWeight } from "@/lib/types";

type Range = "30D" | "3M" | "6M" | "All";
const ranges: Range[] = ["30D", "3M", "6M", "All"];

function rangeStart(range: Range, anchor: string) {
  if (range === "All") return "0000-01-01";
  const date = parseCalendarDate(anchor);
  const days = range === "30D" ? 29 : range === "3M" ? 89 : 179;
  date.setDate(date.getDate() - days);
  return localDateString(date);
}

function ChartTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: DailyWeight }>;
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 shadow-lg">
      <p className="text-xs font-medium text-[var(--muted)]">{formatCalendarDate(point.date, { month: "short", day: "numeric" })}</p>
      <p className="mt-1 text-sm font-semibold">Daily average: {point.average.toFixed(1)} lb</p>
      <p className="mt-0.5 text-xs text-[var(--muted)]">{point.measurementCount} {point.measurementCount === 1 ? "measurement" : "measurements"}</p>
    </div>
  );
}

export function WeightChart({ data }: { data: DailyWeight[] }) {
  const [range, setRange] = useState<Range>("30D");
  const filtered = useMemo(() => {
    const start = rangeStart(range, data.at(-1)?.date ?? localDateString());
    return data.filter((point) => point.date >= start);
  }, [data, range]);

  const latest = data.at(-1);
  const previous = data.at(-2);
  const difference = latest && previous ? latest.average - previous.average : null;
  const values = filtered.map((point) => point.average);
  const domain = values.length
    ? [Math.floor(Math.min(...values) - 2), Math.ceil(Math.max(...values) + 2)]
    : [0, 1];

  return (
    <section className="mt-11 border-t border-[var(--line)] pt-9 sm:mt-14 sm:pt-12" aria-labelledby="trend-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="trend-heading" className="text-sm font-medium text-[var(--muted)]">Daily trend</h2>
          {latest ? (
            <div className="mt-2">
              <p className="text-[2.25rem] font-semibold leading-none tracking-[-0.055em]">{latest.average.toFixed(1)} <span className="text-base font-medium tracking-normal text-[var(--muted)]">lb</span></p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {difference === null ? "Latest daily average" : `${difference > 0 ? "+" : ""}${difference.toFixed(1)} lb from previous day`}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">No data yet</p>
          )}
        </div>
        <div className="flex rounded-xl bg-black/[0.045] p-1" aria-label="Chart time range">
          {ranges.map((item) => (
            <button key={item} type="button" onClick={() => setRange(item)} aria-pressed={range === item} className={`min-h-9 min-w-10 rounded-lg px-2 text-xs font-semibold transition ${range === item ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 h-[260px] w-full sm:h-[300px]">
        {filtered.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filtered} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e5e5e0" strokeDasharray="3 5" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={28} tickMargin={12} tick={{ fill: "#777a74", fontSize: 11 }} tickFormatter={(value: string) => formatCalendarDate(value, { month: "short", day: "numeric" })} />
              <YAxis domain={domain} axisLine={false} tickLine={false} width={52} tickMargin={8} tick={{ fill: "#777a74", fontSize: 11 }} tickFormatter={(value: number) => `${value}`} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#a9aaa5", strokeDasharray: "3 3" }} />
              <Line type="monotone" dataKey="average" stroke="#355f4b" strokeWidth={2.5} dot={{ r: 3.5, fill: "#f7f7f5", stroke: "#355f4b", strokeWidth: 2 }} activeDot={{ r: 5, fill: "#355f4b", stroke: "white", strokeWidth: 2 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line)] px-8 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m4 16 5-5 4 3 7-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <p className="mt-4 font-medium">{data.length ? "No measurements in this range" : "Your trend will appear here"}</p>
            <p className="mt-1.5 text-sm leading-5 text-[var(--muted)]">{data.length ? "Choose a longer range to see earlier data." : "Add your first measurement to get started."}</p>
          </div>
        )}
      </div>
    </section>
  );
}
