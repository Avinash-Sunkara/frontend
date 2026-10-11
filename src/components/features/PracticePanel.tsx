"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Async, Button, Empty } from "@/components/ui/kit";
import { useAction, useGet } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";
import { Rich } from "./Rich";

interface Result { correct: boolean; answerIndex: number; explanation?: string }

/** MCQ practice. The correct answer is only revealed by the backend after submitting. */
export function PracticePanel({ base, slug }: { base: string; slug: string }) {
  const q = useGet<Question[]>(`${base}/topics/${slug}/questions`);
  return (
    <Async q={q} isEmpty={(d) => d.length === 0} empty={<Empty title="No practice questions yet" hint="Check back soon — new questions are added regularly." />}>
      {(qs) => <div className="space-y-5">{qs.map((x, i) => <Q key={x.id} base={base} q={x} n={i + 1} />)}</div>}
    </Async>
  );
}
function Q({ base, q, n }: { base: string; q: Question; n: number }) {
  const [sel, setSel] = useState<number | undefined>(q.selected);
  const [res, setRes] = useState<Result | null>(null);
  const submit = useAction<{ choice: number }, Result>("post", `${base}/questions/${q.id}/answer`, { onSuccess: (r) => setRes(r), invalidate: [[`${base}/categories`]] });
  return (
    <div className="rounded-2xl border border-line p-5">
      <p className="mb-3 font-semibold"><span className="mr-2 font-mono text-faint">{n}.</span></p>
      <Rich html={q.prompt} />
      <div className="mt-4 grid gap-2">
        {q.options?.map((o, i) => {
          const right = res && i === res.answerIndex, wrong = res && sel === i && !res.correct;
          return (
            <button key={i} disabled={!!res} onClick={() => setSel(i)} aria-pressed={sel === i}
              className={cn("flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                right ? "border-brand bg-brand/10" : wrong ? "border-hard bg-hard/10" : sel === i ? "border-brand/60 bg-brand/5" : "border-line hover:border-faint")}>
              <span>{o}</span>{right && <Check className="h-4 w-4 text-brand" />}{wrong && <X className="h-4 w-4 text-hard" />}</button>);
        })}
      </div>
      {!res ? <Button className="mt-4" size="sm" disabled={sel === undefined} loading={submit.isPending} onClick={() => submit.mutate({ choice: sel! })}>Check answer</Button> :
        <div className="mt-4 rounded-xl bg-raised p-4 text-sm"><p className={cn("font-bold", res.correct ? "text-brand" : "text-hard")}>{res.correct ? "Correct" : "Not quite"}</p>{res.explanation && <div className="mt-2"><Rich html={res.explanation} /></div>}</div>}
    </div>
  );
}
