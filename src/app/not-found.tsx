import Link from "next/link";
export default function NotFound() {
  return (<main className="grid min-h-dvh place-items-center p-6 text-center"><div><p className="text-6xl font-extrabold text-brand">404</p><h1 className="mt-3 text-2xl font-bold">Page not found</h1>
    <p className="mt-1 text-muted">That page doesn&apos;t exist or has moved.</p><Link href="/dashboard" className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink">Back to dashboard</Link></div></main>);
}
