"use client";
import { useEffect, useRef, useState } from "react";
import type { PdfDocLike } from "@/lib/pdf";

/** Renders a single PDF page to a <canvas>. No text layer is created, so text can't be selected/copied from the page. */
export function PdfCanvas({ doc, page, zoom }: { doc: PdfDocLike; page: number; zoom: number }) {
  const ref = useRef<HTMLCanvasElement>(null); const [busy, setBusy] = useState(true);
  useEffect(() => {
    let cancelled = false; let task: { cancel(): void } | null = null;
    (async () => {
      setBusy(true);
      const p = await doc.getPage(page); const canvas = ref.current; if (!canvas || cancelled) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const base = p.getViewport({ scale: 1 }); const fit = Math.min(1.6, (canvas.parentElement?.clientWidth ?? base.width) / base.width);
      const vp = p.getViewport({ scale: fit * zoom * dpr });
      canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
      canvas.style.width = `${Math.floor(vp.width / dpr)}px`; canvas.style.height = `${Math.floor(vp.height / dpr)}px`;
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      task = p.render({ canvasContext: ctx, viewport: vp, canvas }); try { await (task as any).promise; } catch { /* cancelled */ }
      if (!cancelled) setBusy(false);
    })();
    return () => { cancelled = true; task?.cancel(); };
  }, [doc, page, zoom]);
  return <div className="relative mx-auto w-fit max-w-full"><canvas ref={ref} aria-label={`Page ${page}`} className="mx-auto block rounded-lg bg-white shadow-xl" />{busy && <div className="absolute inset-0 grid place-items-center text-sm text-muted">Rendering…</div>}</div>;
}
