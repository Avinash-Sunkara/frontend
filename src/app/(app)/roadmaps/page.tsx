"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Map } from "lucide-react";
import { Async, Card, Progress, Skeleton, Empty } from "@/components/ui/kit";
import { AccessBadge, PageHeader } from "@/components/features/bits";
import { useGet } from "@/hooks/useApi";
import type { Roadmap } from "@/lib/types";

export default function Page() {
  const q = useGet<Roadmap[]>("/roadmaps");
  return (
    <div className="space-y-6">
      <PageHeader title="Pick a" accent="roadmap" sub="A clear path from first topic to interview-ready, with your progress tracked along the way." />
      <Async q={q} skeleton={<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>} isEmpty={(d) => d.length === 0} empty={<Empty title="No roadmaps published yet" />}>
        {(list) => <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}>
            <Link href={`/roadmaps/${r.id}`} className="block h-full"><Card className="flex h-full flex-col gap-3 p-5 transition-colors hover:border-brand/40">
              <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-xl text-brand">{r.icon || <Map className="h-5 w-5" />}</span><AccessBadge access={r.access} price={r.price} /></div>
              <h3 className="text-lg font-bold">{r.title}</h3>{r.description && <p className="line-clamp-2 text-sm text-muted">{r.description}</p>}
              <div className="mt-auto"><div className="mb-1.5 flex justify-between text-xs text-muted"><span>{r.sectionCount} sections</span><span className="flex items-center gap-1">{r.locked && <Lock className="h-3 w-3" />}{r.completion}%</span></div><Progress value={r.completion} /></div>
            </Card></Link></motion.div>))}</div>}
      </Async>
    </div>
  );
}
