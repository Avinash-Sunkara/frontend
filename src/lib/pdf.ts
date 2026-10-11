/** Thin, testable helpers around pdf.js. Imported dynamically so the 400 kB library only loads when a PDF is opened. */
export interface PdfDocLike {
  numPages: number;
  getPage(n: number): Promise<{
    getViewport(o: { scale: number }): { width: number; height: number };
    render(o: { canvasContext: CanvasRenderingContext2D; viewport: any; canvas?: HTMLCanvasElement }): { promise: Promise<void>; cancel(): void };
    getTextContent(): Promise<{ items: { str?: string }[] }>;
  }>;
  destroy(): Promise<void>;
}

export async function loadPdfModule() {
  const pdfjs = await import("pdfjs-dist");
  if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  }
  return pdfjs;
}

export async function openPdf(data: ArrayBuffer): Promise<PdfDocLike> {
  const pdfjs = await loadPdfModule();
  return (await pdfjs.getDocument({ data: new Uint8Array(data), enableXfa: false }).promise) as unknown as PdfDocLike;
}

/** Returns the 1-based page numbers whose text contains `query` (case-insensitive). Page text is cached by the caller-provided map. */
export async function searchPdf(doc: Pick<PdfDocLike, "numPages" | "getPage">, query: string, cache = new Map<number, string>()): Promise<number[]> {
  const q = query.trim().toLowerCase(); if (!q) return [];
  const hits: number[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    let text = cache.get(n);
    if (text === undefined) {
      const tc = await (await doc.getPage(n)).getTextContent();
      text = tc.items.map((i) => i.str ?? "").join(" ").toLowerCase(); cache.set(n, text);
    }
    if (text.includes(q)) hits.push(n);
  }
  return hits;
}
