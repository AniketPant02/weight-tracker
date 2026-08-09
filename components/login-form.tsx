"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ initialError }: { initialError?: string | null }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function signInWithGoogle() {
    setPending(true);
    setError(null);

    const { error: authError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback/google`,
      },
    });

    if (authError) {
      setError("Google sign-in couldn’t be started. Please try again.");
      setPending(false);
    }
  }

  return (
    <section>
      <h1 className="text-[2rem] font-semibold tracking-[-0.045em]">
        Welcome back
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Your private weight history, on every device.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-7 rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={pending}
        className="mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-xl border border-[var(--line)] bg-white px-4 font-semibold text-[var(--foreground)] shadow-[0_3px_12px_rgba(20,25,20,0.04)] transition hover:border-black/25 hover:bg-black/[0.015] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.87A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.87V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.61Z" />
          <path fill="#EA4335" d="M12 6c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.61C7.18 7.76 9.39 6 12 6Z" />
        </svg>
        {pending ? "Opening Google…" : "Continue with Google"}
      </button>

      <p className="mt-5 text-center text-xs leading-5 text-[var(--muted)]">
        Measurements are stored privately in Postgres and protected by your account.
      </p>
    </section>
  );
}
