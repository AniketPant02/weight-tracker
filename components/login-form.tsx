"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createClient();
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setPending(false);
    if (result.error) {
      setMessage({ kind: "error", text: result.error.message });
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage({ kind: "success", text: "Check your email to confirm your account, then sign in." });
      setMode("login");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <section>
      <h1 className="text-[2rem] font-semibold tracking-[-0.045em]">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-[var(--muted)]">Your private weight history, on every device.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input name="email" type="email" autoComplete="email" required className="h-13 w-full rounded-xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)] focus:ring-3 focus:ring-[var(--accent-soft)]" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input name="password" type="password" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required className="h-13 w-full rounded-xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)] focus:ring-3 focus:ring-[var(--accent-soft)]" />
        </label>
        {message && (
          <p role="status" className={`rounded-xl px-4 py-3 text-sm leading-5 ${message.kind === "error" ? "bg-red-50 text-red-700" : "bg-[var(--accent-soft)] text-[var(--accent)]"}`}>
            {message.text}
          </p>
        )}
        <button type="submit" disabled={pending} className="mt-2 h-13 w-full rounded-xl bg-[var(--foreground)] font-semibold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-60">
          {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(null); }} className="mt-6 min-h-11 w-full text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </section>
  );
}
