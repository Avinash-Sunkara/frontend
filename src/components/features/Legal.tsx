import Link from "next/link";
import { Logo } from "@/components/ui/kit";
import { BRAND } from "@/config/brand";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  const unfilled = Object.values(BRAND.legal).some((v) => /^\[.*\]$/.test(v) || v === "support@example.com");
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between"><Logo /><Link href="/" className="text-sm text-muted hover:text-fg">Home</Link></div>
      <h1 className="mt-10 text-4xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-faint">Last updated: {BRAND.legal.updated}</p>
      {process.env.NODE_ENV !== "production" && unfilled && (
        <p role="note" className="mt-4 rounded-xl border border-medium/30 bg-medium/10 p-3 text-sm text-medium">Dev notice: set the NEXT_PUBLIC_LEGAL_* variables so the bracketed placeholders below are filled in. Have a lawyer review this template before launch.</p>)}
      <div className="prose-rb mt-8 [&_h2]:!text-xl [&_h2]:!border-0 [&_h2]:!mt-8">{children}</div>
    </main>
  );
}
