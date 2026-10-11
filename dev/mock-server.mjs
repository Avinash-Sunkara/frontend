// Zero-dependency mock of the API contract (docs/API_CONTRACT.md) for local development and e2e tests.
//   node dev/mock-server.mjs            → http://localhost:4000/api/v1   (set NEXT_PUBLIC_API_URL to that)
// Logins: user@example.com / password1   ·   admin@example.com / password1
import http from "node:http";
const PORT = process.env.PORT || 4000, ORIGIN = process.env.ORIGIN || "http://localhost:3000", BASE = "/api/v1";
const users = { "user@example.com": { id: "u1", fullName: "Asha Rao", username: "asha", email: "user@example.com", role: "USER", streak: 3 }, "admin@example.com": { id: "a1", fullName: "Admin", username: "admin", email: "admin@example.com", role: "ADMIN", streak: 0 } };
const sessions = new Map(); const co = (id, name) => ({ id, name });
const companies = [co("c1", "Google"), co("c2", "Amazon"), co("c3", "TCS")];
const state = {}; // problemId -> {solved,bookmarked,revision,hintUsed,note}
const mkP = (n, title, diff, topic, sub) => ({ id: `p${n}`, number: n, title, difficulty: diff, topic, subtopic: sub, pattern: topic, companies: companies.slice(0, 1 + (n % 3)), leetcodeUrl: `https://leetcode.com/problems/${title.toLowerCase().replace(/\W+/g, "-")}/`, youtubeUrl: n % 2 ? "https://youtu.be/dQw4w9WgXcQ" : undefined, description: "<p>Solve it in O(n).</p>", hints: ["Think about two indices.", "Sort first?"], quickNotes: "<p>Remember the invariant.</p>", tags: [topic], access: "FREE" });
const problems = [mkP(1, "Two Sum", "Easy", "Array", "Basics"), mkP(2, "Trapping Rain Water", "Hard", "Array", "Two-Pointer"), mkP(3, "Valid Palindrome", "Easy", "Strings", "Basics"), mkP(4, "3Sum", "Medium", "Array", "Two-Pointer")];
const withState = (p) => ({ ...p, state: { solved: false, bookmarked: false, revision: false, hintUsed: false, ...(state[p.id] || {}) } });
const sheets = [{ id: "s1", slug: "pattern-wise", title: "Pattern Wise Sheet", description: "Topic by topic.", topicCount: 2, problemCount: 4 }, { id: "s2", slug: "last-minute-100", title: "Last Minute 100", description: "Short version.", topicCount: 1, problemCount: 2 }, { id: "s3", slug: "sbc", title: "SBC", description: "Service based companies.", topicCount: 1, problemCount: 2 }];
const solvedCount = () => problems.filter((p) => state[p.id]?.solved).length;
const topics = [{ id: "t1", title: "Array", description: "Contiguous collections.", subtopics: [{ id: "st1", title: "Basics", problemCount: 1, solvedCount: 0 }, { id: "st2", title: "Two-Pointer", description: "Pairs or opposite-end traversal.", tip: "Use two indices.", problemCount: 2, solvedCount: 0 }] }, { id: "t2", title: "Strings", description: "Essential strings." }];
const html = `<h2 id="a">1. Divisibility Rules</h2><p>Last digit even → divisible by 2.</p><table><tr><th>Divisor</th><th>Rule</th></tr><tr><td>3</td><td>Sum of digits</td></tr></table><h2 id="b">2. HCF &amp; LCM</h2><p>Use prime factors.</p>`;
const cat = (base) => [{ id: `${base}1`, slug: base === "core" ? "sql" : "quant", title: base === "core" ? "SQL" : "Quant Aptitude", topicCount: 2 }, { id: `${base}2`, slug: base === "core" ? "dbms" : "logic", title: base === "core" ? "DBMS" : "Logical Reasoning", topicCount: 1 }];
const patterns = [{ id: "pt1", title: "PATTERN 1 — BASIC", topics: [{ id: "tp1", title: "SELECT", slug: "select" }, { id: "tp2", title: "DISTINCT", slug: "distinct" }] }];
const topicBody = (slug) => ({ id: slug, slug, title: slug.toUpperCase(), patternTitle: "PATTERN 1 — BASIC", summary: "Listing columns by name.", html, headings: [{ id: "a", text: "1. Divisibility Rules", level: 2 }, { id: "b", text: "2. HCF & LCM", level: 2 }], practiceCount: 1 });
const notes = [{ id: "n1", title: "SQL Notes", description: "Complete SQL.", category: "SQL", access: "FREE", locked: false, pages: 3 }, { id: "n2", title: "Premium DSA Notes", category: "DSA", access: "PREMIUM", price: 199, locked: true }];
const interviews = [{ id: "i1", company: "HCLTech", role: "Java Developer", level: "3+ yrs", difficulty: "Medium", rounds: 4, status: "Selected", title: "HCLTech Java Developer — core Java then architecture", summary: "Four stages.", tags: ["Java"], likes: 6, comments: 0, createdAt: new Date(Date.now() - 30 * 864e5).toISOString(), background: "3+ yrs experience.", roundDetails: [{ title: "Screening call", body: "<p>Recruiter chat.</p>" }], questions: ["What is a HashMap?"], verdict: "Selected — 17 LPA." }];
const contributions = Array.from({ length: 120 }, (_, i) => ({ date: new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), count: (i * 7) % 6 }));
const crud = {}; // admin collections
const col = (k) => (crud[k] ??= [{ id: `${k}-1`, title: `Sample ${k}`, name: `Sample ${k}`, published: true, access: "FREE" }]);

const json = (res, code, body, extra = {}) => { res.writeHead(code, { "Content-Type": "application/json", ...cors(extra.origin), ...extra.headers }); res.end(body === undefined ? "" : JSON.stringify(body)); };
const cors = (o) => ({ "Access-Control-Allow-Origin": o || ORIGIN, "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS" });
const page = (items, q) => { const p = +q.get("page") || 1, s = +q.get("pageSize") || 20; return { items: items.slice((p - 1) * s, p * s), total: items.length, page: p, pageSize: s, nextPage: p * s < items.length ? p + 1 : null }; };
const pdf = () => { const objs = ["<</Type/Catalog/Pages 2 0 R>>", "<</Type/Pages/Kids[3 0 R]/Count 1>>", "<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>", null, "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>"]; const s = "BT /F1 18 Tf 20 100 Td (Mock PDF page about SQL joins) Tj ET"; objs[3] = `<</Length ${s.length}>>stream\n${s}\nendstream`; let out = "%PDF-1.4\n", off = []; objs.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; }); const x = out.length; out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("") + `trailer<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${x}\n%%EOF`; return Buffer.from(out); };

http.createServer(async (req, res) => {
  const origin = req.headers.origin; const u = new URL(req.url, "http://x"); const q = u.searchParams; let path = u.pathname.replace(BASE, "");
  if (req.method === "OPTIONS") return json(res, 204, undefined, { origin });
  const chunks = []; for await (const c of req) chunks.push(c); let body = {}; try { body = JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch {}
  const sid = /rb_session=([^;]+)/.exec(req.headers.cookie || "")?.[1]; const me = sessions.get(sid); const m = req.method; const ok = (b) => json(res, 200, b, { origin });
  const need = () => { if (!me) { json(res, 401, { message: "Not signed in" }, { origin }); return false; } return true; };
  const login = (email, password, admin) => { const user = users[email]; if (!user || password !== "password1" || (admin && user.role !== "ADMIN")) return json(res, 401, { message: "Invalid credentials" }, { origin }); const id = Math.random().toString(36).slice(2); sessions.set(id, user); json(res, 200, user, { origin, headers: { "Set-Cookie": `rb_session=${id}; HttpOnly; Path=/; SameSite=Lax` } }); };
  try {
    if (path === "/auth/login" && m === "POST") return login(body.email, body.password);
    if (path === "/admin/auth/login" && m === "POST") return login(body.email, body.password, true);
    if (path === "/auth/register" && m === "POST") { if (users[body.email]) return json(res, 409, { message: "exists", field: "email" }, { origin }); users[body.email] = { id: "u" + Date.now(), role: "USER", streak: 0, ...body }; return login(body.email, body.password === "password1" ? "password1" : "password1"); }
    if (path === "/auth/logout") { sessions.delete(sid); return json(res, 204, undefined, { origin, headers: { "Set-Cookie": "rb_session=; Max-Age=0; Path=/" } }); }
    if (path === "/auth/refresh") return me ? ok({}) : json(res, 401, {}, { origin });
    if (path === "/auth/me") return need() && ok(me);
    if (path === "/auth/forgot-password" || path === "/auth/reset-password") return ok({});
    if (path.startsWith("/public/testimonials")) return ok([{ id: "t1", name: "Sample Student", handle: "@sample", quote: "The pattern-wise sheet helped me a lot.", rating: 5 }]);
    if (path.startsWith("/public/founder")) return json(res, 404, {}, { origin });
    if (path === "/auth/providers") return ok({ google: false, github: false });
    if (/^\/auth\/oauth\/(google|github)$/.test(path) && m === "GET") {
      res.writeHead(302, { Location: `${ORIGIN}/auth/callback?error=not_configured` }); res.end(); return;
    }
    if (path === "/public/courses") return ok([{ id: "c1", title: "Placement Crash Course", description: "Eight weeks of guided DSA, core CS and mock interviews.", level: "Beginner", duration: "8 weeks", priceLabel: "₹4,999", highlights: ["Weekly live doubt sessions", "Two mock interviews"], ctaLabel: "Enrol now" }]);
    const PUZ = [{ id: "pz1", title: "100 Prisoners and a Lightbulb", slug: "prisoners-lightbulb", difficulty: "Hard", pattern: "Logic", description: "A warden offers 100 prisoners a deal...", hints: ["Pick one counter."], solution: "Nominate a counter who tallies the bulb switches." }, { id: "pz2", title: "Two Eggs, 100 Floors", slug: "two-eggs", difficulty: "Medium", pattern: "Optimisation", description: "Find the highest safe floor with two eggs.", hints: [], solution: "Drop at 14, 27, 39, ..." }];
    if (path === "/puzzles/patterns") return ok([{ pattern: "Logic", count: 1 }, { pattern: "Optimisation", count: 1 }]);
    if (path === "/puzzles") return ok(page(PUZ.filter((x) => (!q.get("difficulty") || x.difficulty === q.get("difficulty")) && (!q.get("pattern") || x.pattern === q.get("pattern")) && x.title.toLowerCase().includes((q.get("q") || "").toLowerCase())).map(({ id, title, slug, difficulty, pattern }) => ({ id, title, slug, difficulty, pattern })), q));
    const pm = /^\/puzzles\/([^/]+)$/.exec(path);
    if (pm) { const x = PUZ.find((z) => z.slug === pm[1] || z.id === pm[1]); return x ? ok(x) : json(res, 404, { message: "Puzzle not found" }, { origin }); }
    if (!need()) return;
    if (path === "/notifications/popups") return ok([{ id: "pop1", title: "New SQL Cheat Sheet is available", type: "info" }]);
    if (path.startsWith("/notifications/popups/")) return ok({});
    if (path === "/dashboard") { const s = solvedCount(); return ok({ progress: { solved: s, total: 620, easy: { solved: 0, total: 123 }, medium: { solved: s, total: 425 }, hard: { solved: 0, total: 72 } }, streak: { current: 3, longest: 9 }, studyMinutes: 135, counts: { bookmarks: 2, revision: 1, notes: 1 }, contributions, contributionTotal: contributions.reduce((a, c) => a + c.count, 0), continueLearning: [{ title: "Pattern Wise Sheet", href: "/sheets", progress: 12, kind: "DSA" }], todaysPlan: [{ id: "1", title: "Solve 2 Array problems", href: "/sheets", done: false }], recentlySolved: problems.slice(0, 1).map(withState), recommended: problems.slice(1, 3).map(withState), revisionDue: [], latestNotes: notes.map((n) => n), newRoadmaps: [], latestInterviews: interviews }); }
    if (path === "/sheets/overview") return ok({ sheets: sheets.map((s) => ({ ...s, solvedCount: solvedCount() })), totals: { sheets: 3, topics: 4, problems: 620, solved: solvedCount() }, difficulty: { Easy: { solved: 0, total: 123 }, Medium: { solved: solvedCount(), total: 425 }, Hard: { solved: 0, total: 72 } } });
    let r; if ((r = /^\/sheets\/[^/]+\/topics$/.exec(path))) return ok(topics.map((t) => ({ ...t, problemCount: problems.filter((p) => p.topic === t.title).length, solvedCount: problems.filter((p) => p.topic === t.title && state[p.id]?.solved).length })));
    if ((r = /^\/sheets\/[^/]+\/topics\/([^/]+)\/problems$/.exec(path))) { const t = topics.find((x) => x.id === r[1]); const qq = (q.get("q") || "").toLowerCase(); return ok(page(problems.filter((p) => p.topic === t?.title && p.title.toLowerCase().includes(qq) && (!q.get("difficulty") || p.difficulty === q.get("difficulty")) && (q.get("bookmarked") !== "true" || state[p.id]?.bookmarked)).map(withState), q)); }
    if (path === "/companies") return ok(companies);
    if ((r = /^\/problems\/([^/]+)$/.exec(path))) { const p = problems.find((x) => x.id === r[1]); return p ? ok(withState(p)) : json(res, 404, { message: "Not found" }, { origin }); }
    if ((r = /^\/problems\/([^/]+)\/(solved|bookmark|revision|note|hint|revised)$/.exec(path))) { const st = (state[r[1]] ??= {}); const k = { solved: "solved", bookmark: "bookmarked", revision: "revision" }[r[2]]; if (k) st[k] = !!body.value; if (r[2] === "note") st.note = body.note; if (r[2] === "hint") st.hintUsed = true; return ok({}); }
    if (path === "/revision/counts") return ok({ flagged: 1, hint: 0, notes: 0, wrong: 0, recent: 1 });
    if (path === "/revision") return ok({ counts: {}, items: problems.filter((p) => state[p.id]?.revision).map(withState) });
    if (path === "/bookmarks") return ok(page(problems.filter((p) => state[p.id]?.bookmarked).map(withState), q));
    if (path === "/activity/summary") return ok({ contributions, total: 400, current: 3, longest: 9, studyMinutes: 135, byType: { Solved: 40, Notes: 5, Practice: 12 } });
    if (path === "/activity/feed") return ok(page([{ id: "e1", type: "solve", text: "Solved Two Sum", at: new Date().toISOString() }], q));
    if (path === "/activity/calendar") return ok({ days: { [new Date().toISOString().slice(0, 10)]: 2 }, streak: 3 });
    for (const [base, key] of [["/core-cs", "core"], ["/aptitude", "apt"]]) {
      if (path === `${base}/categories`) return ok(cat(key));
      if (/\/categories\/[^/]+\/patterns$/.test(path) && path.startsWith(base)) return ok(patterns);
      if ((r = new RegExp(`^${base}/topics/([^/]+)$`).exec(path))) return ok(topicBody(r[1]));
      if (path.startsWith(`${base}/topics/`) && path.endsWith("/questions")) return ok([{ id: "q1", prompt: "<p>What does SELECT * return?</p>", options: ["One column", "All columns", "Nothing"] }]);
      if (path.startsWith(`${base}/questions/`)) return ok({ correct: body.choice === 1, answerIndex: 1, explanation: "<p>* means all columns.</p>" });
      if (path.endsWith("/complete") && path.startsWith(base)) return ok({});
    }
    if (path === "/notes") return ok(notes.filter((n) => !q.get("category") || n.category === q.get("category")));
    if ((r = /^\/notes\/([^/]+)$/.exec(path))) return ok(notes.find((n) => n.id === r[1]) ?? null);
    if ((r = /^\/notes\/([^/]+)\/viewer$/.exec(path))) return ok({ id: r[1], title: "SQL Notes", pageCount: 1, kind: "pdf", pdfPath: `/notes/${r[1]}/pdf`, watermark: me.email });
    if (/^\/notes\/[^/]+\/pdf$/.test(path)) { res.writeHead(200, { "Content-Type": "application/pdf", "Content-Disposition": "inline", "Cache-Control": "no-store", ...cors(origin) }); return res.end(pdf()); }
    if (path === "/cheat-sheets") return ok([{ id: "cs1", title: "SQL Cheat Sheet", category: "SQL", description: "One page.", access: "FREE", locked: false }]);
    if (path.startsWith("/cheat-sheets/")) return ok({ id: "cs1", title: "SQL Cheat Sheet", category: "SQL", access: "FREE", locked: false, html });
    if (path === "/roadmaps") return ok([{ id: "r1", title: "Java Developer", description: "Zero to hired.", sectionCount: 3, completion: 33, access: "FREE", locked: false }]);
    if (/^\/roadmaps\/[^/]+\/nodes\//.test(path)) return ok({});
    if (/^\/roadmaps\/[^/]+$/.test(path)) return ok({ id: "r1", title: "Java Developer", description: "Zero to hired.", sectionCount: 3, completion: 33, access: "FREE", locked: false, sections: [{ id: "x1", title: "Java Basics", completed: true, children: [{ id: "x2", title: "OOP", resources: [{ id: "rs1", type: "link", title: "Docs", url: "https://docs.oracle.com" }] }] }, { id: "x3", title: "Collections" }, { id: "x4", title: "Spring Boot" }] });
    if (path === "/interviews/stats") return ok({ experiences: 40, companies: 10, selected: 35, companyNames: ["HCLTech", "Amazon"], roles: ["Java Developer"] });
    if (path === "/interviews" && m === "GET") return ok(page(interviews, q));
    if (path === "/interviews" && m === "POST") return ok({});
    if (/^\/interviews\/[^/]+\/comments/.test(path)) return ok(m === "GET" ? [] : {});
    if (/^\/interviews\/[^/]+\/like$/.test(path)) return ok({});
    if (/^\/interviews\/[^/]+$/.test(path)) return ok(interviews[0]);
    if (path === "/search") { const t = (q.get("q") || "").toLowerCase(); return ok({ problems: problems.filter((p) => p.title.toLowerCase().includes(t)).map(withState), topics: [], companies: companies.filter((c) => c.name.toLowerCase().includes(t)), notes: notes.filter((n) => n.title.toLowerCase().includes(t)), roadmaps: [], cheatSheets: [], interviews: interviews.filter((i) => i.company.toLowerCase().includes(t)) }); }
    if (path === "/me/purchases") return ok([]); if (path === "/me" || path === "/me/password" || path === "/me/avatar") return ok({});
    if (path === "/payments/checkout") return ok({ paymentUrl: "https://example.com/pay", orderId: "o1" });
    if (path.startsWith("/payments/orders/")) return ok({ status: "PENDING" });
    // ---- admin
    if (path.startsWith("/admin")) {
      if (me.role !== "ADMIN") return json(res, 403, { message: "Forbidden" }, { origin });
      if (path === "/admin/overview") return ok({ totalUsers: 120, activeUsers: 40, newUsers: 9, problems: 620, notes: 12, roadmaps: 8, cheatSheets: 8, interviews: 40, purchases: 5, revenue: 4995, recent: [{ id: "1", text: "New user joined", at: new Date().toISOString() }] });
      if (path === "/admin/analytics") return ok({ signups: [{ label: "Mon", value: 3 }, { label: "Tue", value: 8 }], activeUsers: [{ label: "Mon", value: 20 }], revenue: [{ label: "Mon", value: 500 }], topProblems: [{ title: "Two Sum", solves: 99 }], topContent: [{ title: "SQL Notes", views: 80 }], totals: { revenue: 4995, conversion: 4 } });
      if (path === "/admin/settings") return ok(m === "GET" ? { siteName: "Mock", supportEmail: "help@example.com", maintenanceMode: false, paymentProvider: "", paymentMode: "GATEWAY", upiDeepLinkTemplate: "", defaultPopupSeconds: 5, signupsOpen: true } : {});
      if (path === "/admin/founder") return ok(m === "GET" ? null : {});
      if (path === "/admin/users" && m === "GET") return ok(page(Object.values(users).map((u) => ({ ...u, blocked: false, premium: false, solved: 3, createdAt: new Date().toISOString() })), q));
      if ((r = /^\/admin\/users\/([^/]+)$/.exec(path)) && m === "GET") return ok({ ...Object.values(users)[0], blocked: false, solved: 3, notesWritten: 1, bookmarks: 2, revision: 1, studyMinutes: 120, contributions, contentViewed: [], purchases: [], entitlements: [] });
      const seg = path.replace("/admin/", ""); const key = seg.split("/").filter((s) => !/^[a-z]+-\d+$/.test(s)).join("/");
      const list = col(key.replace(/\/(publish|reorder|moderate)$/, "")); const id = path.split("/").find((s) => /-\d+$/.test(s));
      if (m === "GET") return ok(page(list, q)); if (m === "POST") { const it = { id: `${key}-${list.length + 1}`, published: false, ...body }; list.push(it); return ok(it); }
      return ok({});
    }
    json(res, 404, { message: `No mock for ${m} ${path}` }, { origin });
  } catch (e) { json(res, 500, { message: String(e) }, { origin }); }
}).listen(PORT, () => console.log(`mock API on http://localhost:${PORT}${BASE}  (CORS origin ${ORIGIN})`));
