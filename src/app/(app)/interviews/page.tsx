"use client";
import { useState } from "react";
import Link from "next/link";
import { Building2, Heart, MessageCircle, MessageSquareQuote, PenLine, Search, Trophy, CheckCircle2, XCircle, Clock, Layers } from "lucide-react";
import { Button, Card, Chip, Empty, Modal, Skeleton, Field, Input, Select, Textarea, useDebounced } from "@/components/ui/kit";
import { useAction, usePaged, useGet } from "@/hooks/useApi";
import { cn, diffColor, timeAgo } from "@/lib/utils";
import type { Interview } from "@/lib/types";
import { StatusPill } from "@/components/features/StatusPill";

function Share({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [f, setF] = useState({ company: "", role: "", level: "", difficulty: "Medium", rounds: 1, status: "Selected", title: "", background: "", body: "" });
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  const m = useAction<typeof f, void>("post", "/interviews", { success: "Submitted for review", invalidate: [["/interviews"]], onSuccess: onClose });
  const ok = f.company && f.role && f.title.length > 5 && f.body.length > 30;
  return (
    <Modal open={open} onClose={onClose} title="Share your experience" wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company"><Input value={f.company} onChange={(e) => set("company", e.target.value)} /></Field>
        <Field label="Role"><Input value={f.role} onChange={(e) => set("role", e.target.value)} /></Field>
        <Field label="Experience level"><Input placeholder="Fresher, 3+ yrs…" value={f.level} onChange={(e) => set("level", e.target.value)} /></Field>
        <Field label="Rounds"><Input type="number" min={1} max={12} value={f.rounds} onChange={(e) => set("rounds", +e.target.value)} /></Field>
        <Field label="Difficulty"><Select value={f.difficulty} onChange={(e) => set("difficulty", e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></Select></Field>
        <Field label="Outcome"><Select value={f.status} onChange={(e) => set("status", e.target.value)}><option>Selected</option><option>Rejected</option><option>Pending</option></Select></Field>
      </div>
      <div className="mt-4 space-y-4">
        <Field label="Title"><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="A one-line summary of the loop" /></Field>
        <Field label="Background"><Textarea rows={3} value={f.background} onChange={(e) => set("background", e.target.value)} /></Field>
        <Field label="Round-by-round" hint="What was asked, in order. Questions and how it went."><Textarea rows={7} value={f.body} onChange={(e) => set("body", e.target.value)} /></Field>
      </div>
      <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={!ok} loading={m.isPending} onClick={() => m.mutate(f)}>Submit</Button></div>
    </Modal>
  );
}

export default function Page() {
  const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [difficulty, setDiff] = useState(""); const [role, setRole] = useState(""); const [company, setCompany] = useState("");
  const [sort, setSort] = useState<"newest" | "top">("newest"); const [share, setShare] = useState(false);
  const dq = useDebounced(q, 350);
  const stats = useGet<{ experiences: number; companies: number; selected: number; companyNames: string[]; roles: string[] }>("/interviews/stats", undefined, { staleTime: 5 * 60_000 });
  const list = usePaged<Interview>("/interviews", { q: dq, status, difficulty, role, company, sort }, 12);
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const total = list.data?.pages[0]?.total ?? 0;
  return (
    <div className="space-y-8">
      <header className="hero-glow mx-auto max-w-3xl pt-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-brand"><MessageSquareQuote className="h-3.5 w-3.5" />Interview experiences</span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">Learn from <span className="text-brand">real interviews</span></h1>
        <p className="mt-4 text-muted">Honest, round-by-round write-ups from candidates who sat in the hot seat — the questions, the verdicts, and the tips that actually move the needle.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          {[[MessageCircle, stats.data?.experiences, "experiences"], [Building2, stats.data?.companies, "companies"], [Trophy, stats.data?.selected, "selected"]].map(([I, n, l]: any) => (
            <span key={l} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-muted"><I className="h-4 w-4 text-brand" /><b className="text-fg">{n ?? "–"}</b>{l}</span>))}</div>
        <Button size="lg" className="mt-6" onClick={() => setShare(true)}><PenLine className="h-4 w-4" />Share your experience</Button>
      </header>

      <Card className="space-y-3 p-4">
        <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" /><input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search interviews" placeholder="Search company, role or title…" className="h-11 w-full rounded-xl border border-line bg-bg pl-10 pr-3 text-sm focus:border-brand/60 focus:outline-none" /></div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex flex-wrap gap-2" aria-label="Status">{["", "Selected", "Rejected", "Pending"].map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s || "All"}</Chip>)}</div>
          <div className="flex flex-wrap gap-2" aria-label="Difficulty">{["", "Easy", "Medium", "Hard"].map((s) => <Chip key={s} active={difficulty === s} onClick={() => setDiff(s)}>{s || "Any"}</Chip>)}</div>
          <Select value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Company" className="h-9 w-40 rounded-full py-0 text-xs"><option value="">All companies</option>{stats.data?.companyNames?.map((c) => <option key={c}>{c}</option>)}</Select>
          <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role" className="h-9 w-40 rounded-full py-0 text-xs"><option value="">All roles</option>{stats.data?.roles?.map((c) => <option key={c}>{c}</option>)}</Select>
        </div>
      </Card>

      <div className="flex items-center justify-between text-sm"><span><b>{total}</b> <span className="text-muted">experiences</span></span>
        <div className="flex items-center gap-2 text-muted">Sort <Chip active={sort === "newest"} onClick={() => setSort("newest")}>Newest</Chip><Chip active={sort === "top"} onClick={() => setSort("top")}>Top</Chip></div></div>

      {list.isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
        : list.error ? <p className="text-hard">{(list.error as Error).message}</p>
        : items.length === 0 ? <Empty title="No experiences match" hint="Try clearing a filter." />
        : (<>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((i) => (
            <Link key={i.id} href={`/interviews/${i.id}`} className="group block"><Card className="flex h-full flex-col gap-3 p-5 transition-colors group-hover:border-brand/40">
              <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 font-bold text-brand">{i.company[0]}</span>
                <div><p className="font-bold leading-tight">{i.company}</p><p className="text-sm text-muted">{i.role}{i.level ? ` (${i.level})` : ""}</p></div></div><StatusPill s={i.status} /></div>
              <div className="flex gap-2"><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", diffColor(i.difficulty))}>{i.difficulty}</span><span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"><Layers className="h-3 w-3" />{i.rounds} round{i.rounds > 1 ? "s" : ""}</span></div>
              <h3 className="text-lg font-bold leading-snug group-hover:text-brand">{i.title}</h3>
              {i.summary && <p className="line-clamp-3 text-sm text-muted">{i.summary}</p>}
              <div className="flex flex-wrap gap-1.5">{i.tags.slice(0, 4).map((t) => <span key={t} className="rounded-md bg-raised px-2 py-0.5 text-xs text-muted">{t}</span>)}</div>
              <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs text-faint"><span>{timeAgo(i.createdAt)}</span>
                <span className="flex gap-4"><span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{i.comments}</span><span className="flex items-center gap-1"><Heart className="h-4 w-4" />{i.likes}</span></span></div>
            </Card></Link>))}</div>
          {list.hasNextPage && <div className="text-center"><Button variant="outline" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>Load more</Button></div>}
        </>)}
      <Share open={share} onClose={() => setShare(false)} />
    </div>
  );
}
