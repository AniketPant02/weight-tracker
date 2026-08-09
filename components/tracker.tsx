"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WeightChart } from "@/components/weight-chart";
import { WeightHistory } from "@/components/weight-history";
import { calculateDailyWeights } from "@/lib/daily-averages";
import { localDateString } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import type { WeightMeasurement } from "@/lib/types";

type Notice = { kind: "success" | "error"; text: string } | null;

export function Tracker({ initialMeasurements, initialError, userId }: {
  initialMeasurements: WeightMeasurement[];
  initialError: string | null;
  userId: string;
}) {
  const router = useRouter();
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [notice, setNotice] = useState<Notice>(
    initialError ? { kind: "error", text: initialError } : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dailyWeights = useMemo(() => calculateDailyWeights(measurements), [measurements]);

  async function addMeasurement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const weight = Number(form.get("weight"));

    if (!Number.isFinite(weight) || weight < 50 || weight > 1000) {
      setNotice({ kind: "error", text: "Enter a weight between 50 and 1,000 lb." });
      inputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setNotice(null);
    const now = new Date();
    const { data, error } = await createClient()
      .from("weight_measurements")
      .insert({
        user_id: userId,
        weight,
        measured_at: now.toISOString(),
        measurement_date: localDateString(now),
      })
      .select("id,user_id,weight,measured_at,measurement_date,created_at")
      .single();

    setSubmitting(false);
    if (error || !data) {
      setNotice({ kind: "error", text: "That measurement wasn’t saved. Please try again." });
      return;
    }

    setMeasurements((current) => [data as WeightMeasurement, ...current]);
    (event.currentTarget as HTMLFormElement).reset();
    setNotice({ kind: "success", text: `${weight.toFixed(1)} lb saved` });
    inputRef.current?.focus();
  }

  async function deleteMeasurement(id: string) {
    const removed = measurements.find((item) => item.id === id);
    if (!removed) return;

    setMeasurements((current) => current.filter((item) => item.id !== id));
    setNotice(null);
    const { error } = await createClient().from("weight_measurements").delete().eq("id", id);

    if (error) {
      setMeasurements((current) =>
        [...current, removed].sort((a, b) => b.measured_at.localeCompare(a.measured_at)),
      );
      setNotice({ kind: "error", text: "That measurement couldn’t be deleted. Please try again." });
      return;
    }
    setNotice({ kind: "success", text: "Measurement deleted" });
  }

  async function signOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[700px] px-5 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 sm:pt-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--accent)] text-white" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9Z" />
              <path d="M9 10a3 3 0 0 1 6 0m-3 0 1.7-2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-semibold tracking-[-0.02em]">Weight</span>
        </div>
        <button type="button" onClick={signOut} disabled={signingOut} className="min-h-11 rounded-lg px-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)] disabled:opacity-50">
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </header>

      <section className="mt-14 sm:mt-20">
        <p className="text-sm font-medium text-[var(--muted)]">Add a measurement</p>
        <form onSubmit={addMeasurement} className="mt-3 flex items-stretch gap-3">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Weight in pounds</span>
            <input
              ref={inputRef}
              name="weight"
              type="number"
              inputMode="decimal"
              min="50"
              max="1000"
              step="0.1"
              enterKeyHint="done"
              placeholder="183.4"
              required
              className="h-16 w-full rounded-2xl border border-[var(--line)] bg-white py-2 pl-5 pr-12 text-[1.65rem] font-semibold tracking-[-0.035em] outline-none transition placeholder:font-normal placeholder:text-black/20 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--muted)]">lb</span>
          </label>
          <button type="submit" disabled={submitting} className="h-16 shrink-0 rounded-2xl bg-[var(--foreground)] px-5 font-semibold text-white shadow-[0_6px_18px_rgba(20,24,20,0.12)] transition hover:bg-black active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 sm:px-7">
            {submitting ? "Saving…" : "Save"}
          </button>
        </form>
        <div className="h-8 pt-2" aria-live="polite">
          {notice && (
            <p className={`fade-in text-sm ${notice.kind === "error" ? "text-red-700" : "text-[var(--accent)]"}`}>
              {notice.kind === "success" && <span aria-hidden="true">✓ </span>}
              {notice.text}
            </p>
          )}
        </div>
      </section>

      <WeightChart data={dailyWeights} />
      <WeightHistory measurements={measurements} onDelete={deleteMeasurement} />
    </main>
  );
}
