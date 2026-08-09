# Weight

A small, private weight tracker built for quick daily use on a phone. Every measurement is retained, while the trend chart shows one arithmetic average per local calendar day.

## 1. Install

Requirements: Node.js 22 or newer and a Supabase account.

```bash
npm install
```

## 2. Create the Supabase project

Create a project at [supabase.com](https://supabase.com), then open **SQL Editor → New query**. Paste and run the contents of:

```text
supabase/migrations/20260809000000_create_weight_measurements.sql
```

This creates the measurement table, validates the allowed weight range, enables Row Level Security, and limits every operation to rows owned by the signed-in user.

The migration has already been run for the production project. Keep the file in the repository so the database setup remains reproducible.

## 3. Configure Google authentication

In **Supabase → Authentication → Providers**, enable Google with the client ID and client secret from Google Cloud. Disable Email and any other providers so Google is the only available sign-in method.

In Google Cloud, configure:

- Authorized JavaScript origin: `https://weight.aniketpant.me`
- Authorized redirect URI: the Supabase callback displayed on the Google provider page, normally `https://<project-ref>.supabase.co/auth/v1/callback`

In **Supabase → Authentication → URL Configuration**, configure:

- Site URL: `https://weight.aniketpant.me`
- Redirect URL: `https://weight.aniketpant.me/api/auth/callback/google`
- Optional local redirect URL: `http://localhost:3000/api/auth/callback/google`

The app-level callback and the Google Cloud callback serve different purposes. Google returns to Supabase first; Supabase then returns to the app’s `/api/auth/callback/google` route to create the cookie-backed session.

## 4. Configure environment variables

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

The hosted Supabase project owns the Google OAuth client configuration, so this app does not read `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`. If those variables exist in Vercel they must remain server-only—never prefix the secret with `NEXT_PUBLIC_`.

## 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and continue with Google. Local OAuth requires the localhost callback URL listed above to be in Supabase’s redirect allow list.

## 6. Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## 7. Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Add both variables from `.env.local` under **Environment Variables**.
4. Deploy. No custom build settings are required.
5. Confirm the production Site URL and callback URL match the values above.

Sessions are stored in auth cookies and refreshed by `proxy.ts`, so normal return visits remain signed in. Measurement persistence is Postgres-only: the app does not use local storage, IndexedDB, or an offline database. Measurements are fetched from Supabase on authenticated page loads and are available across devices.
