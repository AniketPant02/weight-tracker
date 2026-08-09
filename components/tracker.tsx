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
  const latest = dailyWeights.at(-1);
  const previous = dailyWeights.at(-2);
  const change = latest && previous ? latest.average - previous.average : null;

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
    <main className="mx-auto min-h-dvh max-w-7xl px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
      <header className="flex h-14 items-center justify-between border-b">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold tracking-[-0.02em]">weight-tracker</span>
        </div>
        <button type="button" onClick={signOut} disabled={signingOut} className="min-h-9 rounded-md border bg-[var(--card)] px-3 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--card-raised)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50">
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </header>

      <div className="py-8 sm:py-10">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">Overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Your progress</h1>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="order-2 grid gap-3 sm:grid-cols-3 lg:order-1 lg:col-start-1 lg:row-start-1" aria-label="Weight summary">
            <div className="rounded-xl border bg-[var(--card)] p-5">
              <p className="text-sm text-[var(--muted)]">Current average</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{latest ? latest.average.toFixed(1) : "—"} <span className="text-sm font-normal text-[var(--muted)]">lb</span></p>
            </div>
            <div className="rounded-xl border bg-[var(--card)] p-5">
              <p className="text-sm text-[var(--muted)]">Daily change</p>
              <p className={`mt-2 text-2xl font-semibold tracking-[-0.04em] ${change !== null && change < 0 ? "text-[var(--primary)]" : ""}`}>{change === null ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(1)}`} <span className="text-sm font-normal text-[var(--muted)]">lb</span></p>
            </div>
            <div className="rounded-xl border bg-[var(--card)] p-5">
              <p className="text-sm text-[var(--muted)]">Measurements</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{measurements.length}</p>
            </div>
          </section>

          <div className="order-3 min-w-0 space-y-6 lg:order-2 lg:col-start-1 lg:row-start-2">
            <WeightChart data={dailyWeights} />
            <WeightHistory measurements={measurements} onDelete={deleteMeasurement} />
          </div>

          <section className="order-1 rounded-xl border bg-[var(--card)] p-5 lg:order-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-6" aria-labelledby="add-heading">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
              </span>
              <div>
                <h2 id="add-heading" className="font-semibold">Add measurement</h2>
                <p className="text-sm text-[var(--muted)]">Log your current weight</p>
              </div>
            </div>
            <form onSubmit={addMeasurement} className="mt-6">
              <label className="text-sm font-medium" htmlFor="weight">Weight</label>
              <div className="relative mt-2">
                <input ref={inputRef} id="weight" name="weight" type="number" inputMode="decimal" min="50" max="1000" step="0.1" enterKeyHint="done" placeholder="183.4" required className="h-11 w-full rounded-md border bg-[var(--background)] px-3 pr-11 text-sm outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[color:rgba(190,242,100,0.16)]" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">lb</span>
              </div>
              <button type="submit" disabled={submitting} className="mt-3 h-10 w-full rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[#c8f26e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] active:translate-y-px disabled:cursor-wait disabled:opacity-60">
                {submitting ? "Saving…" : "Save measurement"}
              </button>
            </form>
            <div className="min-h-8 pt-3" aria-live="polite">
              {notice && <p className={`fade-in text-sm ${notice.kind === "error" ? "text-[var(--destructive)]" : "text-[var(--primary)]"}`}>{notice.kind === "success" && <span aria-hidden="true">✓ </span>}{notice.text}</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
