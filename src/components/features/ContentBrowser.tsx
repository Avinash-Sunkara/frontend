"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CheckCircle2, Menu, PencilLine, Search } from "lucide-react";
import { Async, Button, Card, Empty, ListSkeleton, Skeleton, Tabs, useDebounced } from "@/components/ui/kit";
import { Rich } from "./Rich";
import { AccessGate } from "./AccessGate";
import { PracticePanel } from "./PracticePanel";
import { CoreMockTest } from "./CoreMockTest";
import { useAction, useGet } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import type { ContentTopic, CoreCategory, CorePattern } from "@/lib/types";

/**
 * Shared three-pane reader (left topic nav · centre content · right "On this page").
 * Used by Core CS (OOP/SQL/DBMS/OS/CN) and Aptitude (Quant/Reasoning).
 * `base` = "/core-cs" | "/aptitude" — maps to API `${base}/categories`, `${base}/categories/:slug/patterns`, `${base}/topics/:slug`.
 */
function Inner({ base, searchPlaceholder, withPractice }: { base: string; searchPlaceholder: string; withPractice?: boolean }) {
  const router = useRouter(); const path = usePathname(); const sp = useSearchParams();
  const cats = useGet<CoreCategory[]>(`${base}/categories`, undefined, { staleTime: 10 * 60_000 });
  const catSlug = sp.get("c") ?? cats.data?.[0]?.slug;
  const [q, setQ] = useState(""); const dq = useDebounced(q, 300);
  const [navOpen, setNavOpen] = useState(false);
  const patterns = useGet<CorePattern[]>(catSlug ? `${base}/categories/${catSlug}/patterns` : null, { q: dq });
  const firstTopic = patterns.data?.[0]?.topics?.[0]?.slug;
  const topicSlug = sp.get("t") ?? (dq ? undefined : firstTopic);
  const set = (c?: string, t?: string) => { const p = new URLSearchParams(); if (c) p.set("c", c); if (t) p.set("t", t); router.push(`${path}?${p}`, { scroll: false }); setNavOpen(false); };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap gap-3" role="tablist">
          {cats.isLoading ? <Skeleton className="h-16 w-72" /> : cats.data?.map((c) => (
            <button key={c.id} role="tab" aria-selected={c.slug === catSlug} onClick={() => set(c.slug)}
              className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors", c.slug === catSlug ? "border-brand/40 bg-brand/10" : "border-line bg-surface hover:border-faint")}>
              <span className={cn("grid h-10 w-10 place-items-center rounded-full", c.slug === catSlug ? "bg-brand text-brand-ink" : "bg-raised text-muted")}><BookOpen className="h-4 w-4" /></span>
              <span><span className={cn("block font-bold", c.slug === catSlug && "text-brand")}>{c.title}</span><span className="text-xs text-muted">{c.topicCount} topics</span></span></button>))}
        </div>
        <div className="relative w-full lg:w-96"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} aria-label="Search topics" className="h-12 w-full rounded-2xl border border-line bg-surface pl-10 pr-3 text-sm placeholder:text-faint focus:border-brand/60 focus:outline-none" /></div>
      </div>
      {cats.error && <Async q={cats}>{() => null}</Async>}

      <Button variant="outline" className="lg:hidden" onClick={() => setNavOpen(!navOpen)}><Menu className="h-4 w-4" />Topics</Button>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_240px]">
        <nav aria-label="Topics" className={cn("max-h-[calc(100dvh-14rem)] overflow-y-auto rounded-2xl border border-line bg-surface lg:sticky lg:top-6 lg:block", navOpen ? "block" : "hidden")}>
          {patterns.isLoading ? <div className="p-3"><ListSkeleton rows={8} /></div> : patterns.error ? <p className="p-4 text-sm text-hard">{(patterns.error as Error).message}</p> :
            !patterns.data?.length ? <p className="p-4 text-sm text-muted">No topics match.</p> :
              patterns.data.map((pt) => (
                <div key={pt.id} className="border-b border-line last:border-0">
                  <div className="flex items-center justify-between bg-raised/50 px-4 py-2.5 text-xs font-bold text-brand"><span>{pt.title}</span><span className="text-faint">{pt.topics.length}</span></div>
                  {pt.topics.map((t) => (
                    <button key={t.id} title={t.title} onClick={() => set(catSlug, t.slug)}
                      className={cn("flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors", t.slug === topicSlug ? "bg-brand/15 font-semibold text-brand" : "text-muted hover:bg-raised hover:text-fg")}>
                      <span className="truncate">{t.title}</span>{t.completed && <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />}</button>))}
                </div>))}
        </nav>
        {topicSlug ? <TopicPane key={topicSlug} base={base} slug={topicSlug} withPractice={withPractice} /> : <Empty title="Select a topic" hint="Pick something from the list to start reading." />}
      </div>
    </div>
  );
}

function TopicPane({ base, slug, withPractice }: { base: string; slug: string; withPractice?: boolean }) {
  const q = useGet<ContentTopic>(`${base}/topics/${slug}`);
  const [tab, setTab] = useState<"notes" | "practice">("notes");
  const [active, setActive] = useState("");
  const done = useAction<void, void>("post", `${base}/topics/${slug}/complete`, { invalidate: [[`${base}/categories`]], success: "Marked complete", onSuccess: () => q.refetch() });
  const heads = useMemo(() => q.data?.headings ?? [], [q.data]);
  useEffect(() => {
    if (!heads.length) return;
    const io = new IntersectionObserver((es) => { const v = es.find((e) => e.isIntersecting); if (v) setActive(v.target.id); }, { rootMargin: "-90px 0px -70% 0px" });
    heads.forEach((h) => { const el = document.getElementById(h.id); el && io.observe(el); });
    return () => io.disconnect();
  }, [heads, tab, q.data?.html]);
  return (
    <>
      <div className="min-w-0">
        <Async q={q} skeleton={<Skeleton className="h-[600px]" />}>
          {(t) => t.locked ? <AccessGate kind="topic" id={t.id} price={t.price} access={t.access === "PRIVATE" ? "PRIVATE" : "PREMIUM"} title={t.title} onUnlocked={() => q.refetch()} /> : (
            <Card className="p-5 sm:p-8">
              {withPractice && (<Tabs value={tab} onChange={setTab} className="mb-6" items={[
                { id: "notes", label: <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Notes</span> },
                { id: "practice", label: <span className="flex items-center gap-2"><PencilLine className="h-4 w-4" />Practice · {t.practiceCount ?? 0}</span> }]} />)}
              {tab === "notes" ? (<>
                {t.patternTitle && <p className="text-xs font-bold text-brand">{t.patternTitle}</p>}
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
                {t.summary && <p className="mt-3 text-lg text-muted">{t.summary}</p>}
                <hr className="my-6 border-line" />
                <Rich html={t.html} />
                <div className="mt-8 flex justify-end">{t.completed ? <span className="flex items-center gap-2 text-sm font-semibold text-brand"><CheckCircle2 className="h-4 w-4" />Completed</span> : <Button variant="outline" loading={done.isPending} onClick={() => done.mutate(undefined as never)}>Mark topic complete</Button>}</div>
              </>) : base === "/core-cs" ? <CoreMockTest slug={slug} /> : <PracticePanel base={base} slug={slug} />}
            </Card>)}
        </Async>
      </div>
      <aside className="hidden xl:block"><div className="sticky top-6">
        {heads.length > 0 && tab === "notes" && (<><p className="mb-3 text-xs font-bold text-muted">ON THIS PAGE</p>
          <ul className="space-y-0.5 border-l border-line">{heads.map((h) => (
            <li key={h.id}><a href={`#${h.id}`} className={cn("-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors", h.level > 2 && "pl-7", active === h.id ? "border-brand text-brand" : "border-transparent text-muted hover:text-fg")}>{h.text}</a></li>))}</ul></>)}
      </div></aside>
    </>
  );
}

export function ContentBrowser(props: { base: string; searchPlaceholder: string; withPractice?: boolean }) {
  return <Suspense><Inner {...props} /></Suspense>;
}
