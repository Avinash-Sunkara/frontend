"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (<main className="grid min-h-dvh place-items-center p-6 text-center"><div><h1 className="text-2xl font-bold">Something broke</h1><p className="mt-1 text-muted">Try again — if it keeps happening, let us know.</p>
    <button onClick={reset} className="mt-6 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink">Reload</button></div></main>);
}
