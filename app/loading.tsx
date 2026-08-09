export default function Loading() {
  return (
    <main className="mx-auto min-h-dvh max-w-[700px] px-5 pb-16 pt-[max(2rem,env(safe-area-inset-top))] sm:px-8">
      <div className="h-5 w-16 animate-pulse rounded bg-black/10" />
      <div className="mt-20 h-28 animate-pulse rounded-3xl bg-black/5" />
      <div className="mt-14 h-72 animate-pulse rounded-3xl bg-black/5" />
    </main>
  );
}
