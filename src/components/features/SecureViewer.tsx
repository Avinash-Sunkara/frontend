"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Search, X, ZoomIn, ZoomOut } from "lucide-react";
import { Async, Button, Skeleton } from "@/components/ui/kit";
import { Rich } from "./Rich";
import { useGet } from "@/hooks/useApi";
import { useAuth } from "@/providers/auth";
import { API_URL, get } from "@/lib/api";
import { openPdf, searchPdf, type PdfDocLike } from "@/lib/pdf";
import { PdfCanvas } from "./PdfCanvas";
import { cn } from "@/lib/utils";
import type { NoteViewer } from "@/lib/types";

/**
 * Embedded viewer. Pages are rendered as images (or sanitized HTML) served by the backend per-page, so no downloadable file URL is ever exposed.
 * Frontend deterrents: no download/print UI, context-menu & drag disabled, print stylesheet hides content, tiled email watermark.
 * NOTE: nothing in a browser can fully prevent screenshots — real protection is server-side (short-lived signed page URLs, rate limits, server-burned watermark).
 */
export function SecureViewer({ endpoint }: { endpoint: string }) {
  const q = useGet<NoteViewer>(`${endpoint}/viewer`, undefined, { staleTime: 0 });
  return <Async q={q} skeleton={<Skeleton className="h-[70dvh]" />}>{(v) => <Viewer v={v} endpoint={endpoint} />}</Async>;
}

function Viewer({ v, endpoint }: { v: NoteViewer; endpoint: string }) {
  const { user } = useAuth();
  const wrap = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1); const [zoom, setZoom] = useState(1); const [full, setFull] = useState(false);
  const [doc, setDoc] = useState<PdfDocLike | null>(null); const [pdfErr, setPdfErr] = useState(""); const textCache = useRef(new Map<number, string>());
  const [q, setQ] = useState(""); const [hits, setHits] = useState<number[] | null>(null); const [searching, setSearching] = useState(false);
  const mark = v.watermark || user?.email || "";
  const wm = useMemo(() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='340' height='200'><text x='20' y='120' transform='rotate(-24 170 100)' font-family='sans-serif' font-size='15' fill='rgba(128,128,128,0.22)'>${mark.replace(/[<&>]/g, "")}</text></svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  }, [mark]);
  const pageCount = doc?.numPages ?? v.pageCount;
  const go = useCallback((n: number) => setPage(Math.min(pageCount, Math.max(1, n))), [pageCount]);
  // PDF mode: fetch bytes with the session cookie (no-store, inline) and render with pdf.js
  useEffect(() => {
    if (v.kind !== "pdf") return; let dead = false; let d: PdfDocLike | null = null;
    (async () => {
      try {
        const r = await fetch(`${API_URL}${v.pdfPath ?? `${endpoint}/pdf`}`, { credentials: "include", cache: "no-store" });
        if (!r.ok) throw new Error(r.status === 403 ? "You don't have access to this document." : "Couldn't load the document.");
        d = await openPdf(await r.arrayBuffer()); if (dead) { d.destroy(); return; } setDoc(d);
      } catch (e: any) { if (!dead) setPdfErr(e.message || "Couldn't load the document."); }
    })();
    return () => { dead = true; d?.destroy(); };
  }, [v.kind, v.pdfPath, endpoint]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") go(page + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(page - 1);
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault(); // block save/print shortcuts
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [page, go]);
  useEffect(() => { const f = () => setFull(!!document.fullscreenElement); document.addEventListener("fullscreenchange", f); return () => document.removeEventListener("fullscreenchange", f); }, []);

  const search = async () => {
    if (!q.trim()) return setHits(null);
    setSearching(true);
    try {
      const pages = v.kind === "pdf" && doc ? await searchPdf(doc, q, textCache.current) : (await get<{ pages: number[] }>(`${endpoint}/search`, { q })).pages;
      setHits(pages); if (pages[0]) go(pages[0]);
    } finally { setSearching(false); }
  };
  const src = (v.pageUrlTemplate ?? "").replace("{page}", String(page));

  return (
    <div ref={wrap} className={cn("secure-viewer overflow-hidden rounded-2xl border border-line bg-surface", full && "flex h-dvh flex-col rounded-none")}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-2.5">
        <p className="mr-auto truncate px-2 text-sm font-semibold">{v.title}</p>
        {v.kind !== "html" && (<>
          {(v.searchable || v.kind === "pdf") && (
            <form onSubmit={(e) => { e.preventDefault(); search(); }} className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search in document" aria-label="Search in document" className="h-9 w-44 rounded-lg border border-line bg-bg pl-8 pr-7 text-sm focus:border-brand/60 focus:outline-none" />
              {q && <button type="button" aria-label="Clear" onClick={() => { setQ(""); setHits(null); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-faint"><X className="h-3.5 w-3.5" /></button>}
            </form>)}
          {hits && <span className="text-xs text-muted">{hits.length ? `Found on pages ${hits.slice(0, 6).join(", ")}${hits.length > 6 ? "…" : ""}` : searching ? "Searching…" : "No matches"}</span>}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => go(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="flex items-center gap-1 text-sm"><input aria-label="Page number" inputMode="numeric" value={page} onChange={(e) => go(parseInt(e.target.value || "1", 10) || 1)} className="h-8 w-12 rounded-lg border border-line bg-bg text-center" />/ {pageCount}</span>
            <Button variant="ghost" size="icon" aria-label="Next page" disabled={page >= pageCount} onClick={() => go(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}><ZoomOut className="h-4 w-4" /></Button>
            <button className="w-12 text-xs text-muted" onClick={() => setZoom(1)} aria-label="Reset zoom">{Math.round(zoom * 100)}%</button>
            <Button variant="ghost" size="icon" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, +(z + 0.15).toFixed(2)))}><ZoomIn className="h-4 w-4" /></Button>
          </div></>)}
        <Button variant="ghost" size="icon" aria-label="Toggle fullscreen" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : wrap.current?.requestFullscreen())}>{full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</Button>
      </div>
      <div className={cn("no-select relative overflow-auto bg-raised/40", full ? "flex-1" : "max-h-[78dvh] min-h-[60dvh]")} onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
        <div className="relative mx-auto w-fit p-4">
          {v.kind === "html" ? <div className="max-w-3xl bg-surface p-6"><Rich html={v.html || ""} /></div>
            : v.kind === "pdf" ? (pdfErr ? <p className="p-10 text-center text-sm text-hard">{pdfErr}</p> : doc ? <PdfCanvas doc={doc} page={page} zoom={zoom} /> : <p className="p-10 text-center text-sm text-muted">Loading document…</p>) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={`${v.title} — page ${page}`} draggable={false} crossOrigin="use-credentials" style={{ width: `${zoom * 100}%`, minWidth: 320, maxWidth: zoom <= 1 ? "100%" : "none" }} className="mx-auto block select-none rounded-lg bg-white shadow-xl" />)}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: wm }} />
        </div>
      </div>
    </div>
  );
}
