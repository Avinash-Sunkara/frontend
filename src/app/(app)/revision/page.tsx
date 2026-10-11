"use client";
import { useState } from "react";
import { Flag, Lightbulb, NotebookPen, XCircle, Clock3 } from "lucide-react";
import { Async, Card, Empty, Tabs, Skeleton, Button } from "@/components/ui/kit";
import { ProblemRow } from "@/components/features/ProblemRow";
import { PageHeader, Stat } from "@/components/features/bits";
import { useAction, useGet } from "@/hooks/useApi";
import { timeAgo } from "@/lib/utils";
import type { Problem } from "@/lib/types";

type Tab = "flagged" | "hint" | "notes" | "wrong" | "recent";
interface Rev { counts: Record<Tab, number>; items: (Problem & { revisedAt?: string })[] }
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "flagged", label: "Flagged for revision", icon: Flag }, { id: "hint", label: "Solved with hint", icon: Lightbulb },
  { id: "notes", label: "Notes written", icon: NotebookPen }, { id: "wrong", label: "Wrong problems", icon: XCircle }, { id: "recent", label: "Recently solved", icon: Clock3 },
];
export default function Page() {
  const [tab, setTab] = useState<Tab>("flagged");
  const q = useGet<Rev>("/revision", { type: tab });
  const counts = useGet<Rev["counts"]>("/revision/counts");
  const revised = useAction<{ id: string }, void>("post", (b) => `/problems/${b.id}/revised`, { success: "Marked revised", onSuccess: () => { q.refetch(); counts.refetch(); } });
  const remove = useAction<{ id: string; value: boolean }, void>("put", (b) => `/problems/${b.id}/revision`, { success: "Removed from revision", onSuccess: () => { q.refetch(); counts.refetch(); } });
  return (
    <div className="space-y-6">
      <PageHeader title="Revise what you" accent="actually got wrong" sub="Anything you flagged, needed a hint for, or wrote a note on comes back here before your loop." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{TABS.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className="text-left"><Stat label={t.label} value={counts.data?.[t.id] ?? "–"} icon={<t.icon className="h-4 w-4" />} /></button>)}</div>
      <Tabs value={tab} onChange={setTab} items={TABS.map((t) => ({ id: t.id, label: t.label }))} className="max-w-full overflow-x-auto" />
      <Async q={q} skeleton={<Skeleton className="h-64" />} isEmpty={(d) => d.items.length === 0} empty={<Empty title="Nothing here" hint="Flag a problem for revision from any sheet and it will land here." />}>
        {(d) => <Card>{d.items.map((p) => (
          <div key={p.id}><ProblemRow p={p} />
            {tab === "flagged" && <div className="flex items-center justify-end gap-2 border-b border-line bg-raised/30 px-4 py-2 text-xs text-muted last:border-0">
              {p.revisedAt && <span className="mr-auto">Last revised {timeAgo(p.revisedAt)}</span>}
              <Button size="sm" variant="outline" onClick={() => revised.mutate({ id: p.id })}>Mark revised</Button><Button size="sm" variant="ghost" onClick={() => remove.mutate({ id: p.id, value: false })}>Remove from revision</Button></div>}
          </div>))}</Card>}
      </Async>
    </div>
  );
}
