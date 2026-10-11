# CodeWithAws — Placement Prep Frontend

Next.js (App Router) · React 19 · TypeScript · Tailwind · Framer Motion · Lucide · TanStack Query · react-hook-form + zod.
Dark-first, green-accent design system. All data comes from your REST API (`NEXT_PUBLIC_API_URL`); there is no mock data.

## Run
```bash
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL
npm install
npm run dev                    # http://localhost:3000
npm run typecheck && npm test && npm run build
```

## Deploy (Vercel)
Import the repo, set the env vars from `.env.example`, deploy. No other config is needed.

## Backend requirements (important)
- **CORS**: allow your Vercel origin with `credentials: true` (exact origin, not `*`).
- **Cookies**: auth is httpOnly cookies set by the API. Because the API (Render) and the site (Vercel) are on different sites, set cookies with `Secure; SameSite=None` — or, better, put both under one parent domain (`app.example.com` / `api.example.com`) and use `SameSite=Lax`. Safari blocks cross-site cookies, so the same-parent-domain setup is strongly recommended.
- **OAuth**: the frontend sends users to `${API}/auth/oauth/google|github?redirect=<site>/dashboard`; the backend completes the flow, sets the cookies and redirects back.
- **Render free tier** sleeps; the first request can take ~30s. The client shows a network-error message and retries are manual.
- Full endpoint list and response shapes: `docs/API_CONTRACT.md`. Types live in `src/lib/types.ts`.

## Structure
```
src/app/(auth)         login · register · forgot/reset password
src/app/(app)          dashboard · sheets · problems/[id] · core-cs · aptitude · notes · roadmaps
                       cheat-sheets · interviews · revision · bookmarks · activity · profile · search
src/app/admin          login + (panel): overview · users · dsa · core-cs · aptitude · notes ·
                       roadmaps · cheat-sheets · interviews · notifications · analytics · settings
src/components/ui      design-system primitives (kit.tsx)
src/components/features  Heatmap, ProblemRow, SheetView, ContentBrowser (3-pane reader), SecureViewer, AccessGate…
src/components/admin   ResourceManager (generic CRUD: table/cards, modal form, publish, reorder, delete)
src/lib/api.ts         fetch client: credentials, 401 refresh+redirect, 403/404/409/429/5xx handling
src/providers          auth · toast (top-centre popups) · theme · react-query
```

## Local development without a backend
```bash
npm run mock          # dependency-free mock of the full API on :4000  (user@example.com / admin@example.com, password1)
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1 npm run dev
```
Google and GitHub buttons remain visible but disabled against the local mock; configure provider credentials on the real API to enable OAuth.

## Testing
| Command | What it checks |
|---|---|
| `npm test` | unit tests (utils, HTML sanitizer, PDF text search) |
| `npm run check:api` | **contract test** — logs in and verifies ~35 endpoints return the shapes the UI needs. Run it against your real backend: `API_URL=https://… CHECK_EMAIL=… CHECK_PASSWORD=… ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run check:api` |
| `npx playwright install chromium && npm run e2e` | end-to-end flows + **no-horizontal-overflow** + screenshots at desktop (1440), laptop (1280), tablet (iPad), Android (Pixel 7) and iPhone 14. Screenshots land in `e2e/shots/` for your visual review against the reference designs. |

## Notes & PDF viewer
Two modes, chosen by the backend in `GET /notes/:id/viewer`:
- `kind: "pdf"` + `pdfPath` — the PDF bytes are streamed (`Content-Disposition: inline`, `Cache-Control: no-store`, auth cookie required) and rendered to `<canvas>` by **pdf.js**. No text layer is created (no selecting/copying), search runs in the browser, and the user's email is tiled as a watermark.
- `kind: "images"` + `pageUrlTemplate` — stronger: only per-page images ever reach the browser. Prefer this for high-value premium content, since in PDF mode the browser does receive the file bytes (a determined user can extract them from the network tab).
- `kind: "html"` for formatted notes.

## Branding & legal
All branding lives in `src/config/brand.ts` and is driven by `NEXT_PUBLIC_BRAND_*` env vars (name, accent, stats — hidden when empty). `/terms` and `/privacy` are complete templates filled from `NEXT_PUBLIC_LEGAL_*` (entity, address, email, grievance officer, jurisdiction, refund window). They are drafts written for an Indian business, not legal advice — have a lawyer review them and make them match your real refund and data practices before launch.

## Security notes
- No tokens or passwords in localStorage (only the theme preference).
- Notes/cheat sheets are shown page-by-page from backend URLs inside `SecureViewer` (no download UI, watermark, context-menu/print/save-shortcut blocking). Browsers cannot truly stop screenshots — enforce real protection server-side (short-lived signed page URLs, per-user rate limits, server-burned watermark, never return the raw file URL).
- HTML from the API is rendered with a defensive strip of scripts/handlers; **the backend must sanitize HTML on write** with an allow-list.
- Paying: the "Pay Now" button opens the `paymentUrl` the backend returns, then polls `/payments/orders/:id`. Content unlocks **only** when the backend reports `PAID` (gateway webhook or admin verification). Opening a UPI link proves nothing.
- Role checks in the UI are cosmetic. Every `/admin/*` endpoint must enforce ADMIN on the server.
