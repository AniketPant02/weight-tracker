# Weight

A small, private weight tracker built for quick daily use on a phone. Every measurement is retained, while the trend chart shows one arithmetic average per local calendar day.

## 1. Install

Requirements: Node.js 20.9 or newer and a Supabase account.

```bash
npm install
```

## 2. Create the Supabase project

Create a project at [supabase.com](https://supabase.com), then open **SQL Editor → New query**. Paste and run the contents of:

```text
supabase/migrations/20260809000000_create_weight_measurements.sql
```

This creates the measurement table, validates the allowed weight range, enables Row Level Security, and limits every operation to rows owned by the signed-in user.

In **Authentication → Providers → Email**, keep email/password enabled. For a personal deployment, you can either keep email confirmation enabled or turn it off before creating your account.

## 3. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

In the Supabase dashboard, open the project’s **Connect** dialog and copy the Project URL and publishable key (the legacy anon key also works):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Do not use or expose a service-role key. The publishable key is safe in the browser because access is enforced by the included RLS policies.

## 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and sign in. If email confirmation is enabled, confirm the email before signing in.

## 5. Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## 6. Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Add both variables from `.env.local` under **Environment Variables**.
4. Deploy. No custom build settings are required.
5. In Supabase, open **Authentication → URL Configuration** and set the Site URL to your production Vercel URL.

Sessions are stored in secure auth cookies and refreshed by `proxy.ts`, so normal return visits remain signed in. Measurements are fetched fresh on authenticated page loads and are available across devices.
