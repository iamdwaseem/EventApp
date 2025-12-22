# Eventify

Eventify is a Next.js 16 application for discovering events, purchasing tickets with PayPal, managing redemptions, and administering events via Supabase-backed authentication and data.

## Tech Stack
- Next.js 16 (App Router) with TypeScript
- Supabase authentication and Postgres data
- PayPal Checkout (sandbox-ready)
- Tailwind CSS v4 + shadcn/ui-inspired component set
- Vercel Analytics

## Features
- Public landing page with featured events and Supabase config guard.
- Authenticated event catalog with detail pages and PayPal purchase flow.
- Ticket management: view tickets, QR codes, redeem gift codes, and gift tickets to other users.
- Admin dashboard: create/delete events, view tickets, generate redeem codes, and QR verification tool to redeem tickets on-site.
- Middleware-protected routes and Navbar aware of auth/admin state.

## Getting Started
1) Install dependencies
```bash
npm install
# or
pnpm install
```

2) Create an environment file `.env.local` with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PAYPAL_CLIENT_ID=your_paypal_rest_client_id        # server-side
PAYPAL_SECRET=your_paypal_rest_secret              # server-side
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_rest_client_id  # client-side SDK
NEXT_PUBLIC_APP_URL=http://localhost:3000          # or your deployed URL
```

3) Run the app
```bash
npm run dev
```
Visit http://localhost:3000.

Other scripts:
- `npm run lint` – Next.js lint
- `npm run build` / `npm start` – production build & serve

## Required Supabase Tables
The app expects these tables/columns:
- `profiles`: `id (uuid, pk)`, `email (text)`, `full_name`, `is_admin (bool)`; rows should mirror Supabase auth users.
- `events`: `id (uuid)`, `title`, `description`, `date (timestamptz)`, `location`, `capacity (int)`, `price (numeric)`, `created_by (uuid)`.
- `tickets`: `id (uuid)`, `event_id (fk)`, `user_id (fk)`, `qr_code (text)`, `status (text: active|redeemed)`, `purchased_at (timestamp, optional default now())`.
- `redeem_codes`: `id (uuid)`, `code (text unique)`, `event_id (fk)`, `is_used (bool default false)`, `created_by (uuid)`.

Adjust column names/types as needed but keep parity with queries in `app/api` and page components.

## Auth & Routing
- Supabase SSR client in `lib/supabase/server.ts` and middleware redirect users to `/login` when unauthenticated.
- Admin-only routes (`/admin`, `/admin/qr-scanner`, QR verify API) check `profiles.is_admin`.
- OAuth/email magic link callback handled at `/auth/callback`.

## Payments
- PayPal sandbox REST credentials are read via `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`.
- Client SDK uses `NEXT_PUBLIC_PAYPAL_CLIENT_ID`; orders are created server-side (`app/api/paypal/create-order`) and captured at `/api/paypal/capture-order`, which issues a ticket and redirects to `my-tickets`.

## Tickets, Gifting, and Redemption
- Users purchase tickets on event detail pages; tickets store a generated QR code.
- Gift flow: `/ticket/[id]` posts to `/api/tickets/gift` to transfer ownership to another user by email.
- Redeem codes: admins generate codes in `/admin`; users redeem via `/my-tickets` (`/api/tickets/redeem-code`) to mint a ticket.
- On-site validation: admins use `/admin/qr-scanner`, which calls `/api/tickets/verify-qr` to mark tickets as redeemed.

## UI Highlights
- Global navigation in `components/navbar.tsx` shows auth/admin links and logout.
- Shared UI components live in `components/ui`.
- Global styles and theme tokens are in `app/globals.css`; Google Geist fonts are loaded in `app/layout.tsx`.

## Deployment Notes
- `next.config.mjs` sets `images.unoptimized = true` and `typescript.ignoreBuildErrors = true`; align with your CI policy before production.
- Ensure all environment variables are configured on the hosting platform (Vercel, etc.).

## Useful Paths
- Pages: `app/page.tsx`, `app/events`, `app/my-tickets`, `app/admin`, `app/ticket/[id]`.
- APIs: `app/api/paypal/*`, `app/api/tickets/*`.
- Supabase helpers: `lib/supabase/*`.


