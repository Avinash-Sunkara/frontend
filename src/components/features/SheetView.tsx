"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Bookmark, Search, SlidersHorizontal, Lightbulb, Target } from "lucide-react";
import { Async, Card, Empty, ListSkeleton, Progress, Ring, Select, useDebounced, Button } from "@/components/ui/kit";
import { ProblemRow } from "./ProblemRow";
import { CompanyLogo } from "./CompanyLogos";
import { useGet, usePaged } from "@/hooks/useApi";
import { cn, pct } from "@/lib/utils";
import type { Company, Page, Problem, Sheet, Topic } from "@/lib/types";

interface Filters { q: string; difficulty: string; bookmarked: boolean; company: string }

function TopicBlock({ sheetId, topic, f, defaultOpen }: { sheetId: string; topic: Topic; f: Filters; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen || !!f.q);
  const q = usePaged<Problem>(`/sheets/${sheetId}/topics/${topic.id}/problems`, { q: f.q, difficulty: f.difficulty, bookmarked: f.bookmarked, company: f.company }, 25);
  const problems = q.data?.pages.flatMap((p) => p.items) ?? [];
  // group by subtopic (Sheet → Topic → Subtopic → Problems)
  const groups = problems.reduce<Record<string, Problem[]>>((a, p) => { (a[p.subtopic || ""] ||= []).push(p); return a; }, {});
  const sub = Object.fromEntries((topic.subtopics ?? []).map((s) => [s.title, s]));
  return (
    <section id={`topic-${topic.id}`} className="scroll-mt-24">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1"><h3 className="text-2xl font-extrabold tracking-tight">{topic.title}</h3>
          <div className="mt-2 flex items-center gap-3"><Progress value={pct(topic.solvedCount, topic.problemCount)} className="max-w-[260px]" /><span className="font-mono text-xs text-muted">{topic.solvedCount}/{topic.problemCount}</span></div>
          {topic.description && <p className="mt-2 text-sm text-muted">{topic.description}</p>}</div>
        <span className="shrink-0 text-sm text-muted">{topic.problemCount} problems</span>
      </div>
      <Card className="overflow-hidden">
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-4 p-4 text-left hover:bg-raised/40">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/15 text-brand">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
          <span className="flex-1 text-lg font-bold">{topic.title}</span>
          <Ring value={pct(topic.solvedCount, topic.problemCount)} size={46} stroke={4}><span className="text-[11px] font-bold">{topic.solvedCount}/{topic.problemCount}</span></Ring>
        </button>
        {open && (<div className="border-t border-line">
          {q.isLoading ? <div className="p-4"><ListSkeleton rows={4} /></div> : q.error ? <p className="p-4 text-sm text-hard">{(q.error as Error).message}</p> :
            problems.length === 0 ? <p className="p-6 text-center text-sm text-muted">No problems match your filters.</p> :
              Object.entries(groups).map(([name, items]) => (
                <div key={name}>
                  {(name || Object.keys(groups).length > 1) && (
                    <div className="space-y-1 bg-raised/40 px-4 py-2.5 text-sm">
                      <p className="font-semibold">{name || "General"}</p>
                      {sub[name]?.description && <p className="flex items-center gap-1.5 text-xs text-muted"><Target className="h-3 w-3 text-brand" />{sub[name].description}</p>}
                      {sub[name]?.tip && <p className="flex items-center gap-1.5 text-xs text-muted"><Lightbulb className="h-3 w-3 text-medium" />{sub[name].tip}</p>}
                    </div>)}
                  {items.map((p) => <ProblemRow key={p.id} p={p} />)}
                </div>))}
          {q.hasNextPage && <div className="border-t border-line p-3 text-center"><Button variant="ghost" size="sm" loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>Load more</Button></div>}
        </div>)}
      </Card>
    </section>
  );
}

export function SheetView({ sheet, initialCompany = "" }: { sheet: Sheet; initialCompany?: string }) {
  const [q, setQ] = useState(""); const [difficulty, setDiff] = useState(""); const [bookmarked, setBm] = useState(false); const [company, setCompany] = useState(initialCompany);
  const dq = useDebounced(q, 350);
  const f: Filters = { q: dq, difficulty, bookmarked, company };
  const topics = useGet<Topic[]>(`/sheets/${sheet.id}/topics`, { q: dq, difficulty, bookmarked, company });
  const companies = useGet<Company[]>("/companies", { sheetId: sheet.id }, { staleTime: 10 * 60_000 });
  const done = sheet.solvedCount;
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4"><h2 className="text-3xl font-extrabold">{sheet.title}</h2>
          <span className="shrink-0 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">{sheet.topicCount} topics</span></div>
        {sheet.description && <p className="mt-3 max-w-3xl text-muted">{sheet.description}</p>}
        <div className="mt-5 flex items-center gap-4"><Progress value={pct(done, sheet.problemCount)} className="h-2" /><span className="whitespace-nowrap text-sm font-bold">{done}/{sheet.problemCount} <span className="text-brand">{pct(done, sheet.problemCount)}%</span></span></div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems, topics, patterns, companies…" aria-label="Search problems"
            className="h-12 w-full rounded-2xl border border-line bg-surface pl-10 pr-3 text-sm placeholder:text-faint focus:border-brand/60 focus:outline-none" /></div>
        <div className="grid grid-cols-3 gap-3 sm:flex">
          <div className="relative"><SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Select value={difficulty} onChange={(e) => setDiff(e.target.value)} aria-label="Difficulty" className="h-12 rounded-2xl pl-9 sm:w-40"><option value="">Difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></Select></div>
          <Select value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Company" className="h-12 rounded-2xl sm:w-44"><option value="">All companies</option>{companies.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <button onClick={() => setBm(!bookmarked)} aria-pressed={bookmarked} className={cn("flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold", bookmarked ? "border-brand/40 bg-brand/10 text-brand" : "border-line bg-surface text-fg")}><Bookmark className={cn("h-4 w-4", bookmarked && "fill-brand")} />Bookmarked</button>
        </div>
      </div>
      {company && companies.data && <div className="flex items-center gap-2 text-sm text-muted">Filtering by <CompanyLogo c={companies.data.find((c) => c.id === company)!} size={22} /></div>}

      <Async q={topics} skeleton={<ListSkeleton rows={4} />} isEmpty={(d) => d.length === 0} empty={<Empty title="No problems found" hint="Try clearing a filter or searching a different company or pattern." />}>
        {(list) => <div className="space-y-10">{list.map((t, i) => <TopicBlock key={t.id + JSON.stringify(f)} sheetId={sheet.id} topic={t} f={f} defaultOpen={i === 0} />)}</div>}
      </Async>
    </div>
  );
}
