"use client";
import { useState } from "react";
import { Async, Chip, Empty, Skeleton } from "@/components/ui/kit";
import { ContentCard } from "@/components/features/ContentCard";
import { PageHeader } from "@/components/features/bits";
import { useGet } from "@/hooks/useApi";
import type { CheatSheet } from "@/lib/types";

const CATS = ["DSA", "Java", "SQL", "DBMS", "OS", "CN", "Aptitude", "Git & GitHub"];
export default function Page() {
  const [cat, setCat] = useState("");
  const q = useGet<CheatSheet[]>("/cheat-sheets", { category: cat });
  return (
    <div className="space-y-6">
      <PageHeader title="Cheat" accent="sheets" sub="One-page references for the night before an interview." />
      <div className="flex flex-wrap gap-2"><Chip active={!cat} onClick={() => setCat("")}>All</Chip>{CATS.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
      <Async q={q} skeleton={<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>} isEmpty={(d) => d.length === 0} empty={<Empty title="No cheat sheets yet" />}>
        {(items) => <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((c) => <ContentCard key={c.id} href={`/cheat-sheets/${c.id}`} title={c.title} description={c.description} category={c.category} previewUrl={c.previewUrl} access={c.access} price={c.price} locked={c.locked} />)}</div>}
      </Async>
    </div>
  );
}
