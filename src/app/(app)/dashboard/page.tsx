"use client";
import Link from "next/link";
import { BookMarked, Check, Clock, Flame, NotebookPen, RotateCcw, Target, Trophy } from "lucide-react";
import { Async, Card, Progress, Ring, Skeleton, Empty } from "@/components/ui/kit";
import { Heatmap } from "@/components/features/Heatmap";
import { ProblemRow } from "@/components/features/ProblemRow";
import { PageHeader, Section, Stat, AccessBadge } from "@/components/features/bits";
import { useGet } from "@/hooks/useApi";
import { useAuth } from "@/providers/auth";
import { fmtDuration, pct, timeAgo } from "@/lib/utils";
import type { DashboardData } from "@/lib/types";

export default function Dashboard() {
  const { user } = useAuth();
  const q = useGet<DashboardData>("/dashboard");
  return (
    <div className="space-y-8">
      <PageHeader title={`Keep pushing, ${user?.username ?? ""}!`} sub="Building mastery one problem at a time — keep the momentum going!" />
      <Async q={q} skeleton={<div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-56" /></div>}>
        {(d) => (<>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
            <Card className="flex items-center gap-5 p-5">
              <Ring value={pct(d.progress.solved, d.progress.total)} size={104} stroke={9}><div><p className="text-2xl font-extrabold">{pct(d.progress.solved, d.progress.total)}%</p><p className="text-[11px] text-muted">{d.progress.solved}/{d.progress.total}</p></div></Ring>
              <div className="min-w-0 flex-1 space-y-2"><p className="font-bold">Overall progress</p>
                {([["Easy", d.progress.easy, "easy"], ["Medium", d.progress.medium, "medium"], ["Hard", d.progress.hard, "hard"]] as const).map(([l, v, t]) => (
                  <div key={l}><div className="flex justify-between text-xs text-muted"><span>{l}</span><span>{v.solved}/{v.total}</span></div><Progress value={pct(v.solved, v.total)} tone={t} /></div>))}
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat label="Problems solved" value={d.progress.solved} icon={<Target className="h-4 w-4" />} />
              <Stat label="Current streak" value={`${d.streak.current}d`} icon={<Flame className="h-4 w-4 text-medium" />} />
              <Stat label="Longest streak" value={`${d.streak.longest}d`} icon={<Trophy className="h-4 w-4" />} />
              <Stat label="Study time" value={fmtDuration(d.studyMinutes)} icon={<Clock className="h-4 w-4" />} />
              <Stat label="Bookmarks" value={d.counts.bookmarks} icon={<BookMarked className="h-4 w-4" />} />
              <Stat label="Revision queue" value={d.counts.revision} sub={`${d.counts.notes} notes created`} icon={<RotateCcw className="h-4 w-4" />} />
            </div>
          </div>

          <Card className="p-5"><Heatmap data={d.contributions} total={d.contributionTotal} today={d.today} />
            <p className="mt-3 text-xs text-faint">Counts problems solved, revisions, personal notes, study sessions, practice, roadmap milestones and comments. Sign-ins, page views and refreshes do not count.</p></Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Continue learning">
              {d.continueLearning.length ? <div className="space-y-3">{d.continueLearning.map((c) => (
                <Link key={c.href} href={c.href} className="block"><Card className="p-4 transition-colors hover:border-brand/40">
                  <div className="flex justify-between text-sm"><span className="font-semibold">{c.title}</span><span className="text-xs text-faint">{c.kind}</span></div>
                  <Progress value={c.progress} className="mt-3" /></Card></Link>))}</div> : <Empty title="Nothing in progress" hint="Open any sheet or topic and it will show up here." />}
            </Section>
            <Section title="Today's plan">
              {d.todaysPlan.length ? <Card className="divide-y divide-line">{d.todaysPlan.map((t) => (
                <Link key={t.id} href={t.href} className="flex items-center gap-3 p-4 hover:bg-raised/50">
                  <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${t.done ? "border-brand bg-brand text-brand-ink" : "border-line"}`}>{t.done && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                  <span className={t.done ? "text-muted line-through" : "font-medium"}>{t.title}</span></Link>))}</Card> : <Empty title="No plan for today" />}
            </Section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Section title="Recently solved" href="/activity">{d.recentlySolved.length ? <Card>{d.recentlySolved.map((p) => <ProblemRow key={p.id} p={p} compact />)}</Card> : <Empty title="No solves yet" />}</Section>
            <Section title="Recommended problems" href="/sheets">{d.recommended.length ? <Card>{d.recommended.map((p) => <ProblemRow key={p.id} p={p} compact />)}</Card> : <Empty title="No recommendations yet" />}</Section>
          </div>
          <Section title="Revision due" href="/revision">{d.revisionDue.length ? <Card>{d.revisionDue.map((p) => <ProblemRow key={p.id} p={p} compact />)}</Card> : <Empty title="Nothing due" hint="Flag problems for revision and they'll queue up here." />}</Section>

          <div className="grid gap-6 lg:grid-cols-3">
            <Section title="Latest notes" href="/notes"><div className="space-y-3">{d.latestNotes.map((n) => (
              <Link key={n.id} href={`/notes/${n.id}`} className="block"><Card className="flex items-center gap-3 p-4 hover:border-brand/40"><NotebookPen className="h-5 w-5 text-brand" />
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{n.title}</p><p className="text-xs text-faint">{n.category}</p></div><AccessBadge access={n.access} price={n.price} /></Card></Link>))}</div></Section>
            <Section title="New roadmaps" href="/roadmaps"><div className="space-y-3">{d.newRoadmaps.map((r) => (
              <Link key={r.id} href={`/roadmaps/${r.id}`} className="block"><Card className="p-4 hover:border-brand/40"><p className="font-semibold">{r.title}</p><Progress value={r.completion} className="mt-3" /></Card></Link>))}</div></Section>
            <Section title="Latest interview experiences" href="/interviews"><div className="space-y-3">{d.latestInterviews.map((i) => (
              <Link key={i.id} href={`/interviews/${i.id}`} className="block"><Card className="p-4 hover:border-brand/40"><p className="font-semibold">{i.company} · {i.role}</p><p className="text-xs text-faint">{i.status} · {timeAgo(i.createdAt)}</p></Card></Link>))}</div></Section>
          </div>
        </>)}
      </Async>
    </div>
  );
}
