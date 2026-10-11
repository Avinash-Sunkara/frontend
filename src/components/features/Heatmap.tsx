"use client";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const LV = ["bg-raised", "bg-brand/25", "bg-brand/50", "bg-brand/75", "bg-brand"];
export const learningActivityLevel = (count: number) => {
  if (!Number.isFinite(count) || count <= 0) return 0;
  return count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4;
};

/** Contribution grid: columns = weeks, rows = Sun..Sat, square cells. */
export function Heatmap({ data, total, today }: { data: { date: string; count: number }[]; total?: number; today?: string }) {
  const { weeks, months, sum } = useMemo(() => {
    const map = new Map(data.map((d) => [d.date, d.count]));
    const end = new Date(`${today ?? new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
    const endKey = end.toISOString().slice(0, 10);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 364 - start.getUTCDay());
    const weeks: { date: string; count: number; future: boolean }[][] = [];
    const months: { label: string; col: number }[] = [];
    let sum = 0, lastM = -1;
    for (let d = new Date(start), col = 0; d <= end; ) {
      const w: { date: string; count: number; future: boolean }[] = [];
      for (let i = 0; i < 7; i++) {
        const iso = d.toISOString().slice(0, 10), c = map.get(iso) ?? 0, future = iso > endKey;
        if (!future) sum += c;
        if (i === 0 && d.getUTCMonth() !== lastM) {
          lastM = d.getUTCMonth();
          months.push({ label: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(d), col });
        }
        w.push({ date: iso, count: future ? 0 : c, future }); d.setUTCDate(d.getUTCDate() + 1);
      }
      weeks.push(w); col++;
    }
    return { weeks, months, sum };
  }, [data, today]);
  return (
    <div>
      <p className="mb-3 text-sm"><span className="font-bold">{(total ?? sum).toLocaleString()}</span> <span className="text-muted">learning activities in the last year</span></p>
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-max">
          <div className="relative mb-1 ml-8 h-4 text-[11px] text-faint">
            {months.map((m) => <span key={m.col} className="absolute" style={{ left: m.col * 15 }}>{m.label}</span>)}
          </div>
          <div className="flex gap-[3px]">
            <div className="mr-1 grid w-6 grid-rows-7 gap-[3px] text-[10px] text-faint">{["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => <span key={i} className="h-3 leading-3">{d}</span>)}</div>
            {weeks.map((w, i) => (
              <div key={i} className="grid grid-rows-7 gap-[3px]">
                {w.map((c) => {
                  const label = `${c.count} learning activit${c.count === 1 ? "y" : "ies"} on ${c.date}`;
                  return <button key={c.date} type="button" disabled={c.future} title={c.future ? undefined : label}
                    aria-label={c.future ? undefined : label} aria-hidden={c.future}
                    className={cn("h-3 w-3 rounded-[3px] border-0 p-0", c.future ? "pointer-events-none opacity-0" : LV[learningActivityLevel(c.count)])} />;
                })}
              </div>))}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-faint">Less{LV.map((l) => <span key={l} className={cn("h-3 w-3 rounded-[3px]", l)} />)}More</div>
    </div>
  );
}
