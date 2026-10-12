"use client";
import { Award, ExternalLink } from "lucide-react";
import { Async, Button, Card, Empty, Skeleton } from "@/components/ui/kit";
import { useGet } from "@/hooks/useApi";
import type { Certification } from "@/lib/types";

export function CertificationsSection() {
  const q = useGet<Certification[]>("/certifications");
  return <section className="space-y-4" aria-labelledby="certifications-heading">
    <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-semibold text-brand">Keep learning</p><h2 id="certifications-heading" className="mt-1 text-2xl font-extrabold">Recommended certifications</h2><p className="mt-1 text-sm text-muted">Explore credentials selected by the learning team.</p></div><Award className="h-6 w-6 shrink-0 text-brand" /></div>
    <Async q={q} skeleton={<div className="grid gap-4 sm:grid-cols-2">{[0, 1].map((n) => <Skeleton key={n} className="h-64" />)}</div>} isEmpty={(items) => items.length === 0} empty={<Empty title="No certifications added yet" hint="Recommended certification links will appear here." />}>
      {(items) => <div className="grid gap-4 sm:grid-cols-2">{items.map((item) => <Card key={item.id} className="overflow-hidden">
        {item.imageUrl && <div className="border-b border-line bg-raised p-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.imageUrl} alt={`Example certificate for ${item.title}`} className="h-44 w-full rounded-lg object-contain" /></div>}
        <div className="space-y-3 p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-brand">{item.provider}</p><h3 className="mt-1 text-lg font-bold">{item.title}</h3></div>{item.description && <p className="text-sm leading-relaxed text-muted">{item.description}</p>}
          <Button variant="outline" size="sm" onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}><ExternalLink className="h-4 w-4" />View certification</Button>
        </div>
      </Card>)}</div>}
    </Async>
  </section>;
}
