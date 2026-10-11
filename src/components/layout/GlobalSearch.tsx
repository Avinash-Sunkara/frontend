"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounced } from "@/components/ui/kit";
import { useGet } from "@/hooks/useApi";
import type { SearchResults } from "@/lib/types";
import Link from "next/link";

/** Desktop quick-search (⌘K / "/"). Enter opens the full categorised /search page. */
export default function GlobalSearch() {
  const [q, setQ] = useState(""); const [open, setOpen] = useState(false);
  const d = useDebounced(q, 250); const router = useRouter(); const ref = useRef<HTMLInputElement>(null);
  const { data } = useGet<SearchResults>(d.length > 1 ? "/search" : null, { q: d, limit: 4 });
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !/INPUT|TEXTAREA/.test(t.tagName))) { e.preventDefault(); ref.current?.focus(); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  const quick = data ? [
    ...data.problems.map((p) => ({ k: `p${p.id}`, t: p.title, s: "Problem", h: `/problems/${p.id}` })),
    ...data.topics.map((p) => ({ k: `t${p.id}`, t: p.title, s: "Topic", h: p.href })),
    ...data.notes.map((p) => ({ k: `n${p.id}`, t: p.title, s: "Notes", h: `/notes/${p.id}` })),
    ...data.roadmaps.map((p) => ({ k: `r${p.id}`, t: p.title, s: "Roadmap", h: `/roadmaps/${p.id}` })),
    ...data.cheatSheets.map((p) => ({ k: `c${p.id}`, t: p.title, s: "Cheat sheet", h: `/cheat-sheets/${p.id}` })),
    ...data.interviews.map((p) => ({ k: `i${p.id}`, t: p.title, s: "Interview", h: `/interviews/${p.id}` })),
  ].slice(0, 8) : [];
  return (
    <div className="relative mb-5 hidden max-w-xl lg:block">
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) { setOpen(false); router.push(`/search?q=${encodeURIComponent(q)}`); } }}>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input ref={ref} value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search problems, topics, companies, notes…  ( / )" aria-label="Global search"
          className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm placeholder:text-faint focus:border-brand/60 focus:outline-none" />
      </form>
      {open && quick.length > 0 && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          {quick.map((r) => (
            <Link key={r.k} href={r.h} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-raised"><span className="truncate">{r.t}</span><span className="ml-3 shrink-0 text-xs text-faint">{r.s}</span></Link>))}
          <Link href={`/search?q=${encodeURIComponent(q)}`} className="block border-t border-line px-4 py-2.5 text-sm font-medium text-brand hover:bg-raised">See all results</Link>
        </div>)}
    </div>
  );
}
