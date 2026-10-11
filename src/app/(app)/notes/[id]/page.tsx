"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Async, Skeleton } from "@/components/ui/kit";
import { AccessGate } from "@/components/features/AccessGate";
import { SecureViewer } from "@/components/features/SecureViewer";
import { useGet } from "@/hooks/useApi";
import type { NoteItem } from "@/lib/types";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const q = useGet<NoteItem>(`/notes/${id}`);
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/notes" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />All notes</Link>
      <Async q={q} skeleton={<Skeleton className="h-[70dvh]" />}>
        {(n) => (<>
          <div><p className="text-xs font-bold text-brand">{n.category}</p><h1 className="text-3xl font-extrabold tracking-tight">{n.title}</h1>{n.description && <p className="mt-2 text-muted">{n.description}</p>}</div>
          {n.locked ? <AccessGate kind="note" id={n.id} price={n.price} access={n.access === "PRIVATE" ? "PRIVATE" : "PREMIUM"} title={n.title} onUnlocked={() => q.refetch()} /> : <SecureViewer endpoint={`/notes/${n.id}`} />}
        </>)}
      </Async>
    </div>
  );
}
