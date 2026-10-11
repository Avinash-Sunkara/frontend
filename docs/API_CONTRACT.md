# API contract expected by the frontend
Base: `NEXT_PUBLIC_API_URL` (e.g. `https://api.example.com/api/v1`). JSON, cookies (`credentials: include`). Errors: `{ "message": "...", "field"?: "email|username" }` with HTTP 401/403/404/409/429/500.
Paged lists return `{ items, total, page, pageSize, nextPage? }` and accept `page`, `pageSize`, `q`.

## Auth
POST /auth/register {fullName,username,email,password} → User (sets cookies; 409 + `field`)
POST /auth/login {email,password,remember} → User · POST /auth/logout · POST /auth/refresh · GET /auth/me → User
POST /auth/forgot-password {email} · POST /auth/reset-password {token,password}
GET  /auth/oauth/google|github?redirect= (browser redirect flow)
POST /admin/auth/login {email,password} → User (role ADMIN)

## User app
GET /dashboard → DashboardData (includes app-timezone `today`) · GET /activity/summary (includes `today`) · /activity/feed (paged) · /activity/calendar?month=YYYY-MM → {days,streak,today}
GET /sheets/overview → SheetsOverview · GET /sheets/:sheetId/topics?q&difficulty&bookmarked&company → Topic[]
GET /sheets/:sheetId/topics/:topicId/problems (paged; same filters) → Problem[] (with `state`, `subtopic`, `companies[{logoUrl}]`)
GET /companies?sheetId · GET /problems/:id
PUT /problems/:id/solved|bookmark|revision {value} · PUT /problems/:id/note {note} · POST /problems/:id/hint · POST /problems/:id/revised
GET /revision?type=flagged|hint|notes|wrong|recent · GET /revision/counts · GET /bookmarks (paged)
Core CS: GET /core-cs/categories · /core-cs/categories/:slug/patterns?q · /core-cs/topics/:slug · /core-cs/topics/:slug/questions
         POST /core-cs/topics/:slug/complete · POST /core-cs/questions/:id/answer {choice} → {correct,answerIndex,explanation}
Aptitude: same shape under /aptitude
GET /notes?category · /notes/:id · /notes/:id/viewer → NoteViewer · /notes/:id/search?q → {pages:number[]}
   kind "pdf": include `pdfPath` (e.g. /notes/:id/pdf, streamed inline, no-store, cookie-authenticated). kind "images": include `pageCount` + `pageUrlTemplate` containing `{page}` (short-lived, auth-checked URLs). kind "html": include `html`.
GET /cheat-sheets?category · /cheat-sheets/:id (send `fileUrl` as a truthy placeholder only) · /cheat-sheets/:id/viewer
GET /roadmaps · /roadmaps/:id (sections tree) · PUT /roadmaps/:id/nodes/:nodeId {completed}
GET /interviews (paged; q,status,difficulty,role,company,sort) · /interviews/stats · /interviews/:id · POST /interviews
POST /interviews/:id/like (toggle) · GET|POST /interviews/:id/comments · DELETE /interviews/:id/comments/:cid
GET /search?q&limit → SearchResults · GET /notifications/popups → PopupNotification[] · POST /notifications/popups/:id/seen
PATCH /me {fullName,username} · POST /me/password · GET /me/purchases
Content with `locked: true` must omit its body and return `access` + `price`.

## Payments
POST /payments/checkout {kind,id} → {paymentUrl,orderId} · GET /payments/orders/:id → {status: PENDING|PAID|FAILED}
Mark PAID only from a verified gateway webhook (or an admin verification action).

## Admin (all require ADMIN)
GET /admin/overview · GET /admin/analytics?range · GET|PUT /admin/settings
Users: GET /admin/users?q&status · GET /admin/users/:id · PATCH /admin/users/:id/block|unblock · DELETE /admin/users/:id
       POST /admin/users/:id/entitlements {kind,contentId,type} · DELETE /admin/users/:id/entitlements/:eid
CRUD (GET paged, POST, PUT /:id, DELETE /:id, PATCH /:id/publish {published}, PATCH /:id/reorder {direction}) on:
  /admin/dsa/sheets|topics|subtopics|problems · /admin/companies (multipart: name, logo)
  /admin/core-cs/categories|patterns|topics|questions · /admin/aptitude/… (same)
  /admin/notes (multipart: file[], preview, …) · /admin/cheat-sheets · /admin/roadmaps · /admin/roadmaps/nodes
  /admin/interviews (+ PATCH /:id/moderate {approved}) · /admin/notifications (+ POST /:id/publish)
Forms send multipart when a file is chosen (arrays as `key[]`), otherwise JSON.

## Added for landing page, profile and extra admin
GET /public/testimonials → [{id,name,handle?,location?,quote,rating?,avatarUrl?}] (published only; empty list hides the section)
GET /public/founder → {name,title,photoUrl?,bio[],previously?[],stats?[{label,value}],socialLinks?[{label,url}],contactEmail?,copyrightText?,ctaLabel?,ctaUrl?} (404/empty hides the profile section)
POST /me/avatar (multipart `avatar`, ≤2 MB image)
Admin: GET|PUT /admin/founder (multipart: name,title,bio,previously,stats,socialLinks,contactEmail,copyrightText,ctaLabel,ctaUrl,photo); `socialLinks` is one `Label|https://...` entry per line.
       CRUD /admin/testimonials · CRUD /admin/roadmaps/resources {nodeId,type,title,url?,content?,file?}
       POST /admin/users/:id/entitlements accepts kind: note|roadmap|cheat-sheet|problem|topic

## Courses and puzzles
GET /public/courses → [{id,title,description,thumbnailUrl?,level?,duration?,priceLabel?,highlights[],ctaLabel?,ctaUrl?}] (published only; empty list hides the landing section)
GET /puzzles?q&difficulty&pattern&page&pageSize → Page<{id,title,slug,difficulty,pattern?,imageUrl?}> · GET /puzzles/patterns → [{pattern,count}]
GET /puzzles/:slug → {id,title,slug,description,difficulty,pattern?,imageUrl?,solution?,hints[]}   (puzzles are always free)
Admin: CRUD + PATCH /:id/publish + PATCH /:id/reorder on /admin/courses (multipart: thumbnail) and /admin/puzzles (multipart: image); `highlights` and `hints` are newline-separated text.

## Learning activity and streak policy
The heatmap and learning streak use the configured backend `APP_TIMEZONE` calendar day. Qualifying actions are a problem marked solved, a problem revised, a personal note first created, a logged study session, an aptitude practice attempt, a completed roadmap milestone, and an interview comment. Sign-ins, likes, opening/viewing content, route requests, and refreshes do not count. Daily contribution counts are event counts, while streaks count distinct calendar days; today or yesterday keeps a streak current. Marking a problem unsolved removes its solve activity and reconciles that day's aggregate.

OAuth callback URLs must be registered exactly as configured by `GOOGLE_CALLBACK_URL` and `GITHUB_CALLBACK_URL`. In production, set both to the public backend host, e.g. `https://<render-backend-domain>/api/auth/google/callback` and `https://<render-backend-domain>/api/auth/github/callback`. When a callback URL is omitted, `API_URL` or Render's `RENDER_EXTERNAL_URL` is used as the base; production startup rejects partial provider credentials or credentials without a public callback base. Never expose either provider secret in frontend variables or example files.
