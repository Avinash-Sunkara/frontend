"use client";
import { useState } from "react";
import { Check, RotateCcw, Send, Trophy, X } from "lucide-react";
import { Async, Button, Card, Empty } from "@/components/ui/kit";
import { useAction, useGet } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";
import { Rich } from "./Rich";

type MockResult = { score: number; total: number; results: { id: string; choice: number; answerIndex: number; correct: boolean; explanation?: string }[] };

/** A topic-sized mock test: learners answer every question before seeing the key. */
export function CoreMockTest({ slug }: { slug: string }) {
  const questions = useGet<Question[]>(`/core-cs/topics/${slug}/questions`);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<MockResult | null>(null);
  const submit = useAction<{ answers: { questionId: string; choice: number }[] }, MockResult>("post", `/core-cs/topics/${slug}/mock-test/submit`, { onSuccess: setResult });

  return <Async q={questions} isEmpty={(items) => items.length === 0} empty={<Empty title="No practice questions yet" hint="Questions and code programs added by the admin will appear here." />}>
    {(items) => {
      const review = new Map(result?.results.map((r) => [r.id, r]) ?? []);
      const reset = () => { setAnswers({}); setResult(null); submit.reset(); };
      return <div className="space-y-5">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div><p className="font-bold">Topic practice</p><p className="mt-1 text-sm text-muted">{items.length} questions · Answer all questions, then submit to see your score and explanations.</p></div>
          {result ? <div className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 font-bold text-brand"><Trophy className="h-4 w-4" />Score: {result.score}/{result.total}</div> : <span className="rounded-full border border-line px-3 py-1.5 text-sm text-muted">{Object.keys(answers).length}/{items.length} answered</span>}
        </Card>
        {items.map((q, i) => {
          const submitted = review.get(q.id);
          return <Card key={q.id} className="p-5">
            <div className="mb-3 flex min-w-0 items-start gap-2"><span className="shrink-0 font-mono text-sm text-faint">{String(i + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><Rich html={q.prompt} /></div></div>
            <div className="grid gap-2">
              {(q.options ?? []).map((option, index) => {
                const selected = submitted ? submitted.choice === index : answers[q.id] === index;
                const correct = submitted?.answerIndex === index;
                const incorrect = !!submitted && selected && !submitted.correct;
                return <button key={index} type="button" disabled={!!result} aria-pressed={selected} onClick={() => setAnswers((old) => ({ ...old, [q.id]: index }))}
                  className={cn("flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors", correct ? "border-brand bg-brand/10" : incorrect ? "border-hard bg-hard/10" : selected ? "border-brand/60 bg-brand/5" : "border-line hover:border-faint")}>
                  <span>{option}</span>{correct && <Check className="h-4 w-4 text-brand" />}{incorrect && <X className="h-4 w-4 text-hard" />}
                </button>;
              })}
            </div>
            {submitted?.explanation && <div className="mt-4 rounded-xl bg-raised p-4 text-sm"><p className="mb-1 font-bold">Explanation</p><Rich html={submitted.explanation} /></div>}
          </Card>;
        })}
        {result ? <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Try again</Button> : <div className="flex flex-wrap items-center gap-3"><Button disabled={Object.keys(answers).length !== items.length || submit.isPending} loading={submit.isPending} onClick={() => submit.mutate({ answers: items.map((q) => ({ questionId: q.id, choice: answers[q.id] })) })}><Send className="h-4 w-4" />Submit mock test</Button>{Object.keys(answers).length !== items.length && <span className="text-sm text-muted">Answer every question to submit.</span>}</div>}
      </div>;
    }}
  </Async>;
}
