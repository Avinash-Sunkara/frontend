"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Rocket } from "lucide-react";
import { useGet } from "@/hooks/useApi";
import { useAuth } from "@/providers/auth";
import { Card, Progress, Ring, Skeleton } from "@/components/ui/kit";
import { cn, pct } from "@/lib/utils";
import { learningActivityLevel } from "./Heatmap";
import type { SheetsOverview } from "@/lib/types";

const ACTIVITY_LEVELS = ["bg-raised/60 text-faint", "bg-brand/20 text-fg", "bg-brand/40 text-fg", "bg-brand/60 font-semibold text-brand-ink", "bg-brand/80 font-bold text-brand-ink"];

/** Right-hand progress rail used on DSA pages. */
export default function ProgressPanel() {
  const { user } = useAuth();
  const { data, isLoading, isError: progressError } = useGet<SheetsOverview>("/sheets/overview");
  const summary = useGet<{ today: string }>("/activity/summary");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const todayIso = summary.data?.today;
  const month = selectedMonth ?? todayIso?.slice(0, 7) ?? "";
  const cal = useGet<{ days: Record<string, number>; streak: number; today: string }>("/activity/calendar", month ? { month } : undefined, { enabled: !!month });
  const [year, monthNumber] = month ? month.split("-").map(Number) : [0, 1];
  const first = month ? new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() : 0;
  const dim = month ? new Date(Date.UTC(year, monthNumber, 0)).getUTCDate() : 0;
  const t = data?.totals;
  return (
    <Card className="space-y-5 p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand"><Rocket className="h-5 w-5" /></span>
        <div><h2 className="text-lg font-bold leading-tight">Keep pushing, {user?.username}!</h2>
          <p className="mt-1 text-sm text-muted">Building mastery one problem at a time — keep the momentum going!</p></div>
      </div>
      <hr className="border-line" />
      {isLoading ? <Skeleton className="h-24" /> : progressError || !t ? <p role="alert" className="text-sm text-hard">Progress is unavailable right now.</p> : (
        <div className="flex items-center gap-4">
          <Ring value={pct(t.solved, t.problems)} size={96} stroke={8}>
            <div><p className="text-xl font-bold">{pct(t.solved, t.problems)}%</p><p className="text-[11px] text-muted">{t.solved}/{t.problems}</p></div></Ring>
          <div><p className="font-bold">Total progress</p><p className="text-sm text-muted">across all sheets</p></div>
        </div>)}
      {data && (["Easy", "Medium", "Hard"] as const).map((d) => {
        const v = data.difficulty[d];
        return (
          <div key={d}>
            <div className="mb-1.5 flex justify-between text-xs"><span className={cn("font-semibold", d === "Easy" ? "text-easy" : d === "Medium" ? "text-medium" : "text-hard")}>{d}</span>
              <span className="text-muted">{v.solved}/{v.total} <span className="ml-1">{pct(v.solved, v.total)}%</span></span></div>
            <Progress value={pct(v.solved, v.total)} tone={d.toLowerCase() as "easy"} />
          </div>);
      })}
      <hr className="border-line" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand"><Flame className="h-5 w-5" /></span>
          <div><p className="font-bold">{cal.data?.streak ?? user?.streak ?? 0} day</p><p className="text-xs text-muted">learning streak</p></div>
        </div>
        <div className="flex items-center rounded-xl border border-line text-sm font-semibold">
          <button aria-label="Previous month" disabled={!month} className="p-2 text-muted hover:text-fg disabled:opacity-50" onClick={() => setSelectedMonth(new Date(Date.UTC(year, monthNumber - 2, 1)).toISOString().slice(0, 7))}><ChevronLeft className="h-4 w-4" /></button>
          <span className="px-1">{month ? new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleString("en", { month: "long", year: "numeric", timeZone: "UTC" }) : "Loading…"}</span>
          <button aria-label="Next month" disabled={!month || month >= (todayIso?.slice(0, 7) ?? "")} className="p-2 text-muted hover:text-fg disabled:opacity-50" onClick={() => setSelectedMonth(new Date(Date.UTC(year, monthNumber, 1)).toISOString().slice(0, 7))}><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      {summary.isLoading || cal.isLoading ? <Skeleton className="h-28" /> : summary.error || cal.error ? <p role="alert" className="text-sm text-hard">Learning activity is unavailable right now.</p> : <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="py-1 font-semibold">{d}</span>)}
        {Array.from({ length: first }).map((_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: dim }).map((_, i) => {
          const iso = `${month}-${String(i + 1).padStart(2, "0")}`, future = !!todayIso && iso > todayIso, n = future ? 0 : cal.data?.days?.[iso] ?? 0;
          return <span key={iso} title={future ? undefined : `${n} learning activit${n === 1 ? "y" : "ies"} on ${iso}`} className={cn("grid aspect-square place-items-center rounded-lg text-xs", future ? "bg-raised/30 text-faint" : ACTIVITY_LEVELS[learningActivityLevel(n)], iso === todayIso && "ring-2 ring-brand")}>{i + 1}</span>;
        })}
      </div>}
    </Card>
  );
}
