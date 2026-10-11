"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Async, Card, Empty, ListSkeleton, useDebounced } from "@/components/ui/kit";
import { CompanyLogo } from "@/components/features/CompanyLogos";
import { useGet } from "@/hooks/useApi";
import type { SearchResults } from "@/lib/types";

function Group({ title, children, n }: { title: string; children: React.ReactNode; n: number }) {
  if (!n) return null;
  return <section className="space-y-2"><h2 className="text-sm font-bold text-muted">{title} <span className="text-faint">({n})</span></h2><Card className="divide-y divide-line">{children}</Card></section>;
}
const Row = ({ href, title, sub }: { href: string; title: string; sub?: string }) => <Link href={href} className="block px-4 py-3 text-sm hover:bg-raised/50"><span className="font-semibold">{title}</span>{sub && <span className="ml-2 text-xs text-faint">{sub}</span>}</Link>;

function Inner() {
  const initial = useSearchParams().get("q") ?? "";
  const [q, setQ] = useState(initial); const d = useDebounced(q, 300);
  const res = useGet<SearchResults>(d.trim().length > 1 ? "/search" : null, { q: d, limit: 10 });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" placeholder="Search problems, topics, companies, notes, roadmaps…" className="h-14 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-base focus:border-brand/60 focus:outline-none" /></div>
      {d.trim().length < 2 ? <Empty title="Search everything" hint="Problems, topics, companies, notes, roadmaps, cheat sheets and interview experiences." /> : (
        <Async q={res} skeleton={<ListSkeleton rows={5} />} isEmpty={(r) => Object.values(r).every((v) => !v.length)} empty={<Empty title={`No results for “${d}”`} hint="Check the spelling or try a broader term." />}>
          {(r) => (<>
            <Group title="DSA problems" n={r.problems.length}>{r.problems.map((p) => <Row key={p.id} href={`/problems/${p.id}`} title={p.title} sub={`${p.difficulty}${p.pattern ? " · " + p.pattern : ""}`} />)}</Group>
            <Group title="Topics" n={r.topics.length}>{r.topics.map((t) => <Row key={t.id} href={t.href} title={t.title} />)}</Group>
            <Group title="Companies" n={r.companies.length}>{r.companies.map((c) => <Link key={c.id} href={`/sheets?company=${encodeURIComponent(c.id)}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-raised/50"><CompanyLogo c={c} size={24} /><span className="font-semibold">{c.name}</span></Link>)}</Group>
            <Group title="Notes" n={r.notes.length}>{r.notes.map((n) => <Row key={n.id} href={`/notes/${n.id}`} title={n.title} sub={n.category} />)}</Group>
            <Group title="Roadmaps" n={r.roadmaps.length}>{r.roadmaps.map((n) => <Row key={n.id} href={`/roadmaps/${n.id}`} title={n.title} />)}</Group>
            <Group title="Cheat sheets" n={r.cheatSheets.length}>{r.cheatSheets.map((n) => <Row key={n.id} href={`/cheat-sheets/${n.id}`} title={n.title} sub={n.category} />)}</Group>
            <Group title="Interview experiences" n={r.interviews.length}>{r.interviews.map((n) => <Row key={n.id} href={`/interviews/${n.id}`} title={n.title} sub={`${n.company} · ${n.status}`} />)}</Group>
          </>)}
        </Async>)}
    </div>
  );
}
export default function Page() { return <Suspense><Inner /></Suspense>; }
