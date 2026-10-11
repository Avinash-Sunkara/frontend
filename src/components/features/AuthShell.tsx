import { Logo } from "@/components/ui/kit";
import { BRAND } from "@/config/brand";

export function AuthShell({ title, subtitle, children, hero = true }: { title: string; subtitle: string; children: React.ReactNode; hero?: boolean }) {
  return (
    <main className="grid min-h-dvh place-items-center p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-surface/70 md:grid-cols-2">
        <div className="hero-glow relative hidden flex-col justify-between border-r border-line p-10 md:flex">
          <Logo />
          {hero && (<div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Your next offer starts <span className="text-brand">here.</span></h2>
            <p className="mt-4 max-w-sm text-muted">Curated DSA sheets, core CS, aptitude and the interview stories that got people hired — all in one place.</p>
          </div>)}
          <div className="flex gap-8 text-sm text-muted">
            {BRAND.stats.map((s) => <div key={s.label}><p className="text-xl font-bold text-brand">{s.value}</p>{s.label}</div>)}
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <div className="mb-8 md:hidden"><Logo /></div>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mb-7 mt-1 text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
