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
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="font-semibold tracking-[-0.02em]">weight-tracker</span>
        </div>
        <LoginForm initialError={authError} />
      </div>
    </main>
  );
}
