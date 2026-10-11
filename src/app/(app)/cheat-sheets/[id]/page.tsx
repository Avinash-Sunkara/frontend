"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Async, Card, Skeleton } from "@/components/ui/kit";
import { AccessGate } from "@/components/features/AccessGate";
import { SecureViewer } from "@/components/features/SecureViewer";
import { Rich } from "@/components/features/Rich";
import { useGet } from "@/hooks/useApi";
import type { CheatSheet } from "@/lib/types";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const q = useGet<CheatSheet>(`/cheat-sheets/${id}`);
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/cheat-sheets" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />All cheat sheets</Link>
      <Async q={q} skeleton={<Skeleton className="h-[70dvh]" />}>
        {(c) => (<>
          <div><p className="text-xs font-bold text-brand">{c.category}</p><h1 className="text-3xl font-extrabold tracking-tight">{c.title}</h1>{c.description && <p className="mt-2 text-muted">{c.description}</p>}</div>
          {c.locked ? <AccessGate kind="cheat-sheet" id={c.id} price={c.price} access={c.access === "PRIVATE" ? "PRIVATE" : "PREMIUM"} title={c.title} onUnlocked={() => q.refetch()} />
            : c.fileUrl ? <SecureViewer endpoint={`/cheat-sheets/${c.id}`} /> : <Card className="p-6 sm:p-8"><Rich html={c.html ?? ""} /></Card>}
        </>)}
      </Async>
    </div>
  );
}
