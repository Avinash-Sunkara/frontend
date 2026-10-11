"use client";
import { Flame, Trophy } from "lucide-react";
import { Async, Card, Skeleton } from "@/components/ui/kit";
import { Heatmap } from "@/components/features/Heatmap";
import { PageHeader, Stat } from "@/components/features/bits";
import { useGet, usePaged } from "@/hooks/useApi";
import { fmtDuration, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/kit";

interface Summary { contributions: { date: string; count: number }[]; total: number; current: number; longest: number; today: string; studyMinutes: number; byType: Record<string, number> }
interface Ev { id: string; type: string; text: string; at: string }
export default function Page() {
  const s = useGet<Summary>("/activity/summary");
  const feed = usePaged<Ev>("/activity/feed", undefined, 20);
  const items = feed.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Your" accent="activity" sub="Everything you've done in the last year, one square per day." />
      <Async q={s} skeleton={<Skeleton className="h-64" />}>
        {(d) => (<>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Current streak" value={`${d.current}d`} icon={<Flame className="h-4 w-4 text-medium" />} /><Stat label="Longest streak" value={`${d.longest}d`} icon={<Trophy className="h-4 w-4" />} />
            <Stat label="Study time" value={fmtDuration(d.studyMinutes)} /><Stat label="Learning activity" value={d.total} /></div>
          <Card className="p-5"><Heatmap data={d.contributions} total={d.total} today={d.today} /></Card>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{Object.entries(d.byType).map(([k, v]) => <Stat key={k} label={k} value={v} />)}</div>
        </>)}
      </Async>
      <Card className="divide-y divide-line">
        {feed.error && <div role="alert" className="p-4 text-sm text-hard">Activity history could not be loaded. <button className="underline" onClick={() => feed.refetch()}>Try again</button></div>}
        {items.map((e) => <div key={e.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><span>{e.text}</span><span className="shrink-0 text-xs text-faint">{timeAgo(e.at)}</span></div>)}
        {!feed.isLoading && !feed.error && items.length === 0 && <p className="p-6 text-center text-sm text-muted">No activity yet. Solve a problem to get your first square.</p>}
      </Card>
      {feed.hasNextPage && <div className="text-center"><Button variant="outline" loading={feed.isFetchingNextPage} onClick={() => feed.fetchNextPage()}>Load more</Button></div>}
    </div>
  );
}
