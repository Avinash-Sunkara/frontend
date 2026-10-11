// Contract smoke test. Point it at ANY backend (mock or real):
//   API_URL=https://api.example.com/api/v1 CHECK_EMAIL=you@x.com CHECK_PASSWORD=... [ADMIN_EMAIL=.. ADMIN_PASSWORD=..] node scripts/check-api.mjs
const API = (process.env.API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");
let fails = 0; const cookie = {};
const has = (o, keys) => keys.filter((k) => !(o && typeof o === "object" && k in o));
const isPage = (o) => has(o, ["items", "total", "page", "pageSize"]);
async function call(who, method, path, body) {
  const r = await fetch(API + path, { method, headers: { "Content-Type": "application/json", ...(cookie[who] ? { Cookie: cookie[who] } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const sc = r.headers.get("set-cookie"); if (sc) cookie[who] = sc.split(";")[0];
  let data = null; try { data = await r.json(); } catch {} return { status: r.status, data };
}
async function t(name, who, path, check, { method = "GET", body, expect = 200 } = {}) {
  const { status, data } = await call(who, method, path, body); const problems = [];
  if (status !== expect) problems.push(`status ${status} (expected ${expect})`); else if (check && expect < 300) problems.push(...check(data));
  console.log(`${problems.length ? "✗" : "✓"} ${name.padEnd(34)} ${problems.join("; ")}`); if (problems.length) fails++;
}
const user = { email: process.env.CHECK_EMAIL || "user@example.com", password: process.env.CHECK_PASSWORD || "password1" };
const admin = { email: process.env.ADMIN_EMAIL || "admin@example.com", password: process.env.ADMIN_PASSWORD || "password1" };
const userKeys = ["id", "fullName", "username", "email", "role"]; const arr = (d) => (Array.isArray(d) ? [] : ["expected array"]);

await t("unauthenticated /auth/me → 401", "anon", "/auth/me", null, { expect: 401 });
await t("auth providers", "anon", "/auth/providers", (d) => has(d, ["google", "github"]));
await t("login", "u", "/auth/login", (d) => has(d, userKeys), { method: "POST", body: user });
await t("me", "u", "/auth/me", (d) => has(d, userKeys));
await t("dashboard", "u", "/dashboard", (d) => has(d, ["progress", "streak", "studyMinutes", "counts", "contributions", "contributionTotal", "continueLearning", "todaysPlan", "recentlySolved", "recommended", "revisionDue", "latestNotes", "newRoadmaps", "latestInterviews"]));
let sheetId, topicId, problemId;
await t("sheets overview", "u", "/sheets/overview", (d) => { sheetId = d.sheets?.[0]?.id; return [...has(d, ["sheets", "totals", "difficulty"]), ...has(d.sheets?.[0], ["id", "title", "slug", "topicCount", "problemCount", "solvedCount"]), ...has(d.difficulty, ["Easy", "Medium", "Hard"])]; });
await t("sheet topics", "u", `/sheets/${sheetId}/topics`, (d) => { topicId = d?.[0]?.id; return [...arr(d), ...has(d?.[0], ["id", "title", "problemCount", "solvedCount"])]; });
await t("topic problems (paged)", "u", `/sheets/${sheetId}/topics/${topicId}/problems`, (d) => { problemId = d.items?.[0]?.id; return [...isPage(d), ...has(d.items?.[0], ["id", "number", "title", "difficulty", "companies", "state"])]; });
await t("problem detail", "u", `/problems/${problemId}`, (d) => has(d, ["id", "title", "difficulty", "leetcodeUrl", "companies", "state"]));
await t("toggle solved", "u", `/problems/${problemId}/solved`, null, { method: "PUT", body: { value: true } });
await t("companies", "u", "/companies", arr);
for (const base of ["/core-cs", "/aptitude"]) {
  let slug, topic;
  await t(`${base} categories`, "u", `${base}/categories`, (d) => { slug = d?.[0]?.slug; return [...arr(d), ...has(d?.[0], ["id", "slug", "title", "topicCount"])]; });
  await t(`${base} patterns`, "u", `${base}/categories/${slug}/patterns`, (d) => { topic = d?.[0]?.topics?.[0]?.slug; return [...arr(d), ...has(d?.[0], ["id", "title", "topics"])]; });
  await t(`${base} topic`, "u", `${base}/topics/${topic}`, (d) => has(d, ["id", "title", "slug", "html"]));
  await t(`${base} questions`, "u", `${base}/topics/${topic}/questions`, arr);
}
let noteId; await t("notes list", "u", "/notes", (d) => { noteId = d?.find((n) => !n.locked)?.id; return [...arr(d), ...has(d?.[0], ["id", "title", "category", "access", "locked"])]; });
await t("note viewer", "u", `/notes/${noteId}/viewer`, (d) => [...has(d, ["id", "title", "kind"]), ...(d.kind === "pdf" ? has(d, ["pdfPath"]) : d.kind === "images" ? has(d, ["pageCount", "pageUrlTemplate"]) : has(d, ["html"]))]);
await t("cheat sheets", "u", "/cheat-sheets", arr);
await t("roadmaps", "u", "/roadmaps", (d) => [...arr(d), ...has(d?.[0], ["id", "title", "sectionCount", "completion", "access", "locked"])]);
await t("interviews (paged)", "u", "/interviews", (d) => [...isPage(d), ...has(d.items?.[0], ["id", "company", "role", "difficulty", "rounds", "status", "title", "tags", "likes", "comments", "createdAt"])]);
await t("interview stats", "u", "/interviews/stats", (d) => has(d, ["experiences", "companies", "selected"]));
await t("search", "u", "/search?q=sum", (d) => has(d, ["problems", "topics", "companies", "notes", "roadmaps", "cheatSheets", "interviews"]));
await t("popups", "u", "/notifications/popups", arr);
await t("public courses", "anon", "/public/courses", (d) => [...arr(d), ...has(d?.[0], ["id", "title", "description", "highlights"])]);
let puzzleSlug; await t("puzzles (paged)", "anon", "/puzzles", (d) => { puzzleSlug = d.items?.[0]?.slug; return [...isPage(d), ...has(d.items?.[0], ["id", "title", "slug", "difficulty"])]; });
await t("puzzle patterns", "anon", "/puzzles/patterns", (d) => [...arr(d), ...has(d?.[0], ["pattern", "count"])]);
if (puzzleSlug) await t("puzzle detail", "anon", `/puzzles/${puzzleSlug}`, (d) => has(d, ["id", "title", "slug", "description", "difficulty", "hints"]));
await t("revision counts", "u", "/revision/counts", (d) => has(d, ["flagged", "hint", "notes", "wrong", "recent"]));
await t("checkout shape", "u", "/payments/checkout", (d) => has(d, ["paymentUrl", "orderId"]), { method: "POST", body: { kind: "note", id: "n2" } });
await t("admin blocked for user → 403", "u", "/admin/overview", null, { expect: 403 });
await t("admin login", "a", "/admin/auth/login", (d) => has(d, userKeys), { method: "POST", body: admin });
await t("admin overview", "a", "/admin/overview", (d) => has(d, ["totalUsers", "activeUsers", "newUsers", "problems", "notes", "roadmaps", "cheatSheets", "interviews", "purchases", "revenue", "recent"]));
await t("admin users (paged)", "a", "/admin/users", isPage);
await t("admin dsa problems (paged)", "a", "/admin/dsa/problems", isPage);
await t("admin courses (paged)", "a", "/admin/courses", isPage);
await t("admin puzzles (paged)", "a", "/admin/puzzles", isPage);
await t("admin settings", "a", "/admin/settings", (d) => has(d, ["siteName", "paymentMode"]));
console.log(fails ? `\n${fails} check(s) failed` : "\nAll contract checks passed"); process.exit(fails ? 1 : 0);
