"use client";

import { useState, useSyncExternalStore } from "react";
import { groupMeasurementsByDay } from "@/lib/daily-averages";
import { formatCalendarDate } from "@/lib/date";
import type { WeightMeasurement } from "@/lib/types";

export function WeightHistory({ measurements, onDelete }: {
  measurements: WeightMeasurement[];
  onDelete: (id: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const groups = groupMeasurementsByDay(measurements);

  async function remove(id: string) {
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
    setConfirming(null);
  }

  return (
    <section className="mt-12 border-t border-[var(--line)] pt-9 sm:mt-16 sm:pt-12" aria-labelledby="history-heading">
      <h2 id="history-heading" className="text-xl font-semibold tracking-[-0.035em]">History</h2>
      {groups.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Individual measurements will be listed here.</p>
      ) : (
        <div className="mt-7 space-y-11">
          {groups.map((group) => (
            <div key={group.date}>
              <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-3">
                <h3 className="font-semibold">{formatCalendarDate(group.date, { weekday: "long", month: "short", day: "numeric" })}</h3>
                <p className="text-right text-xs text-[var(--muted)]">Avg {group.average.toFixed(1)} lb · {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}</p>
              </div>
              <ul>
                {group.entries.map((measurement) => (
                  <li key={measurement.id} className="group flex min-h-15 items-center gap-3 border-b border-black/[0.055] last:border-0">
                    <time dateTime={measurement.measured_at} className="w-24 shrink-0 text-sm text-[var(--muted)]">
                      {hydrated
                        ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(measurement.measured_at))
                        : "—"}
                    </time>
                    <span className="flex-1 text-right font-semibold tabular-nums">{Number(measurement.weight).toFixed(1)} <span className="text-sm font-normal text-[var(--muted)]">lb</span></span>
                    {confirming === measurement.id ? (
                      <button type="button" disabled={deleting === measurement.id} onClick={() => remove(measurement.id)} onBlur={() => !deleting && setConfirming(null)} autoFocus className="min-h-10 min-w-16 rounded-lg bg-red-50 px-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50" aria-label={`Confirm deleting ${Number(measurement.weight).toFixed(1)} pounds`}>
                        {deleting === measurement.id ? "…" : "Delete?"}
                      </button>
                    ) : (
                      <button type="button" onClick={() => setConfirming(measurement.id)} className="grid size-10 shrink-0 place-items-center rounded-lg text-[var(--muted)] opacity-60 transition hover:bg-black/5 hover:text-red-700 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100" aria-label={`Delete ${Number(measurement.weight).toFixed(1)} pound measurement`}>
                        <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
