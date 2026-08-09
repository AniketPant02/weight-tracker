import { redirect } from "next/navigation";
import { Tracker } from "@/components/tracker";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { WeightMeasurement } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!getSupabaseEnv()) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg items-center px-6 py-16">
        <section className="w-full rounded-3xl border border-[var(--line)] bg-white p-7 shadow-[0_14px_50px_rgba(20,25,20,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Setup needed</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Connect Supabase</h1>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            Copy <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">.env.example</code> to <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">.env.local</code>, add your project URL and publishable key, then restart the app.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/login");

  const measurements: WeightMeasurement[] = [];
  let loadError = false;
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("weight_measurements")
      .select("id,user_id,weight,measured_at,measurement_date,created_at")
      .order("measurement_date", { ascending: false })
      .order("measured_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      loadError = true;
      break;
    }

    const page = (data ?? []) as WeightMeasurement[];
    measurements.push(...page);
    if (page.length < pageSize) break;
  }

  return (
    <Tracker
      initialMeasurements={measurements}
      initialError={loadError ? "Your measurements couldn’t be loaded. Try refreshing." : null}
      userId={claimsData.claims.sub}
    />
  );
}
