import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!getSupabaseEnv()) redirect("/");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect("/");

  const params = await searchParams;
  const authError = params.error
    ? "Google sign-in wasn’t completed. Please try again."
    : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="w-full fade-in">
        <div className="mb-10 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent)] text-white" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9Z" />
              <path d="M9 10a3 3 0 0 1 6 0m-3 0 1.7-2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-[-0.02em]">Weight</span>
        </div>
        <LoginForm initialError={authError} />
      </div>
    </main>
  );
}
