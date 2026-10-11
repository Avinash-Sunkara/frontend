"use client";
import { useState } from "react";
import { Async, Chip, Empty, Skeleton } from "@/components/ui/kit";
import { ContentCard } from "@/components/features/ContentCard";
import { PageHeader } from "@/components/features/bits";
import { useGet } from "@/hooks/useApi";
import type { NoteItem } from "@/lib/types";

const CATS = ["DSA", "SQL", "DBMS", "Operating Systems", "Computer Networks", "Java", "Python", "Aptitude", "Reasoning", "Interview Preparation"];
export default function Page() {
  const [cat, setCat] = useState("");
  const q = useGet<NoteItem[]>("/notes", { category: cat });
  return (
    <div className="space-y-6">
      <PageHeader title="Study" accent="notes" sub="Curated notes, readable right here. Premium notes unlock once with a one-time payment." />
      <div className="flex flex-wrap gap-2"><Chip active={!cat} onClick={() => setCat("")}>All</Chip>{CATS.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
      <Async q={q} skeleton={<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>}
        isEmpty={(d) => d.length === 0} empty={<Empty title="No notes in this category yet" hint="New notes show up here as soon as they're published." />}>
        {(items) => <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((n) => (
          <ContentCard key={n.id} href={`/notes/${n.id}`} title={n.title} description={n.description} category={n.category} previewUrl={n.previewUrl} access={n.access} price={n.price} locked={n.locked} meta={n.pages ? `${n.pages} pages` : undefined} />))}</div>}
      </Async>
    </div>
  );
}
