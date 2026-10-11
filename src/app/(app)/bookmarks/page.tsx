"use client";
import { Button, Card, Empty, ListSkeleton } from "@/components/ui/kit";
import { ProblemRow } from "@/components/features/ProblemRow";
import { PageHeader } from "@/components/features/bits";
import { usePaged } from "@/hooks/useApi";
import type { Problem } from "@/lib/types";

export default function Page() {
  const q = usePaged<Problem>("/bookmarks", undefined, 30);
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Your" accent="bookmarks" sub="Problems you saved for later." />
      {q.isLoading ? <ListSkeleton /> : q.error ? <p className="text-hard">{(q.error as Error).message}</p> : items.length === 0 ? <Empty title="No bookmarks yet" hint="Tap the bookmark icon on any problem to save it here." /> :
        <><Card>{items.map((p) => <ProblemRow key={p.id} p={p} />)}</Card>{q.hasNextPage && <div className="text-center"><Button variant="outline" loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>Load more</Button></div>}</>}
    </div>
  );
}
