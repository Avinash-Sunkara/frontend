"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button, Card, Chip, Empty, ErrorState, Input, ListSkeleton, useDebounced } from "@/components/ui/kit";
import { PageHeader } from "@/components/features/bits";
import { useGet, usePaged } from "@/hooks/useApi";
import { cn, diffColor } from "@/lib/utils";
import type { PuzzleItem, PuzzlePattern } from "@/lib/types";

const DIFFS = ["Easy", "Medium", "Hard"] as const;
export default function Page() {
  const [q, setQ] = useState(""); const dq = useDebounced(q, 300);
  const [difficulty, setDifficulty] = useState(""); const [pattern, setPattern] = useState("");
  const patterns = useGet<PuzzlePattern[]>("/puzzles/patterns", undefined, { staleTime: 5 * 60_000 });
  const list = usePaged<PuzzleItem>("/puzzles", { q: dq, difficulty, pattern }, 20);
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p.items) ?? [], [list.data]);
  const filtered = !!(dq || difficulty || pattern);
  return (
    <div className="space-y-6">
      <PageHeader title="Logic" accent="puzzles" sub="Interview-style brain teasers. Think first, then use the hints, then check the solution." />
      <Input icon={<Search className="h-4 w-4" />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search puzzles…" aria-label="Search puzzles" className="sm:max-w-sm" />
      <div className="flex flex-wrap gap-2"><Chip active={!difficulty} onClick={() => setDifficulty("")}>All levels</Chip>{DIFFS.map((d) => <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>{d}</Chip>)}</div>
      {!!patterns.data?.length && <div className="flex flex-wrap gap-2"><Chip active={!pattern} onClick={() => setPattern("")}>All types</Chip>{patterns.data.map((p) => <Chip key={p.pattern} active={pattern === p.pattern} onClick={() => setPattern(p.pattern)}>{p.pattern} · {p.count}</Chip>)}</div>}
      {list.isLoading ? <ListSkeleton /> : list.error ? <ErrorState error={list.error} retry={() => list.refetch()} /> : rows.length === 0 ? <Empty title={filtered ? "No puzzles match" : "No puzzles yet"} hint={filtered ? "Try a different search or filter." : "Puzzles will appear here once they are published."} /> : (<>
        <div className="grid gap-3 sm:grid-cols-2">{rows.map((p) => (
          <Link key={p.id} href={`/puzzles/${p.slug}`} className="group block">
            <Card className="flex h-full items-center justify-between gap-3 p-4 transition-colors group-hover:border-brand/40">
              <div className="min-w-0"><h3 className="truncate font-bold">{p.title}</h3>{p.pattern && <p className="mt-0.5 truncate text-xs text-muted">{p.pattern}</p>}</div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold", diffColor(p.difficulty))}>{p.difficulty}</span>
            </Card></Link>))}</div>
        {list.hasNextPage && <div className="text-center"><Button variant="outline" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>Load more</Button></div>}
      </>)}
    </div>
  );
}
