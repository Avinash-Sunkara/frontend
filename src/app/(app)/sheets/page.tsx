"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, ListChecks, Layers } from "lucide-react";
import { Async, Skeleton } from "@/components/ui/kit";
import { SheetView } from "@/components/features/SheetView";
import ProgressPanel from "@/components/features/ProgressPanel";
import { CertificationsSection } from "@/components/features/CertificationsSection";
import { useGet } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import type { SheetsOverview } from "@/lib/types";

function Inner() {
  const router = useRouter(); const sp = useSearchParams();
  const q = useGet<SheetsOverview>("/sheets/overview");
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-6">
        <Async q={q} skeleton={<Skeleton className="h-96" />}>
          {(o) => {
            const active = o.sheets.find((s) => s.slug === sp.get("sheet") || s.id === sp.get("sheet")) ?? o.sheets[0];
            if (!active) return <p className="text-muted">No sheets published yet.</p>;
            return (<>
              <header className="hero-glow flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-xl"><p className="text-sm font-semibold text-brand">DSA Sheets</p>
                  <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">Learn patterns, <span className="text-brand">not the problem</span></h1>
                  <p className="mt-3 text-muted">Pattern Wise goes topic by topic. Last Minute 100 is the short version for when the interview is close.</p></div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {[[BookOpen, o.totals.sheets, "sheets"], [Layers, o.totals.topics, "topics"], [ListChecks, o.totals.problems, "problems"]].map(([I, n, l]: any) => (
                    <span key={l} className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-muted"><I className="h-4 w-4 text-brand" /><b className="text-fg">{n}</b>{l}</span>))}</div>
              </header>
              <div className="grid gap-3 sm:grid-cols-3">
                {o.sheets.map((s, i) => (
                  <button key={s.id} onClick={() => router.push(`/sheets?sheet=${s.slug}`, { scroll: false })} aria-pressed={s.id === active.id}
                    className={cn("flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors", s.id === active.id ? "border-brand/40 bg-brand/10" : "border-line bg-surface hover:border-faint")}>
                    <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full font-bold", s.id === active.id ? "bg-brand text-brand-ink" : "bg-raised text-muted")}>{i + 1}</span>
                    <span className="min-w-0"><span className={cn("block truncate font-bold", s.id === active.id && "text-brand")}>{s.title}</span>
                      <span className="text-sm text-muted">{s.solvedCount} / {s.problemCount} solved</span></span></button>))}
              </div>
              <SheetView key={active.id} sheet={active} initialCompany={sp.get("company") ?? ""} />
              <CertificationsSection />
            </>);
          }}
        </Async>
      </div>
      <aside className="hidden xl:block"><div className="sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto"><ProgressPanel /></div></aside>
    </div>
  );
}
export default function Page() { return <Suspense><Inner /></Suspense>; }
