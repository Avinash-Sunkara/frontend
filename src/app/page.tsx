import Link from "next/link";
import { ArrowRight, BookOpenCheck, Brain, Calculator, Database, Layers, MessagesSquare, RotateCcw, ListChecks } from "lucide-react";
import { Logo } from "@/components/ui/kit";
import { Community, Courses, Founder, LandingFooter, PatternPreview, Testimonials } from "@/components/features/LandingSections";

const TRACKS = [
  { icon: Layers, tag: "Pattern-first", title: "DSA Sheets", body: "Problems sequenced pattern by pattern rather than topic by topic, plus a focused Last-Minute 100 for revision day.", href: "/sheets" },
  { icon: Database, tag: "Core CS", title: "Core CS", body: "SQL, DBMS, OOP, OS and networks — the problem, the best approach and the clean answer, side by side.", href: "/core-cs" },
  { icon: Calculator, tag: "MCQ drills", title: "Aptitude", body: "Quant and logical reasoning — crisp theory, then timed MCQ practice.", href: "/aptitude" },
  { icon: MessagesSquare, tag: "Community", title: "Interview stories", body: "Round-by-round breakdowns from candidates who sat the loop — what got asked and how it ended.", href: "/interviews" },
];
const HABITS = [
  { icon: Brain, title: "Learn the pattern, not the problem", body: "Every problem is filed under the pattern that solves it, with the cue that identifies it. You stop memorising hundreds of solutions and start recognising a few dozen shapes." },
  { icon: ListChecks, title: "Work the sequence in order", body: "Each problem assumes the one before it. Tick as you go — progress, notes and bookmarks stay attached to the problem, not a spreadsheet." },
  { icon: RotateCcw, title: "Revise what you actually got wrong", body: "Anything you flagged, needed a hint for, or wrote a note on comes back before your loop." },
];
export default function Landing() {
  return (
    <div className="min-h-dvh">
      <header className="glass sticky top-3 z-30 mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl border border-line px-4 py-3"><Logo />
        <nav className="flex items-center gap-2"><Link href="/login" className="px-3 py-2 text-sm text-muted hover:text-fg">Log in</Link><Link href="/register" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-ink">Start free</Link></nav></header>
      <section className="hero-glow mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">Crack your dream <span className="text-brand">product company</span> from any college.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">A pattern-first placement track for students without a coding culture around them — curated sheets, core CS, aptitude and real interview breakdowns, in one sequence.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-muted">{["DSA Sheets", "Domain", "Aptitude", "Interview Stories", "Roadmaps", "Notes"].map((t) => <span key={t} className="rounded-full border border-line px-4 py-2">{t}</span>)}</div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5"><Link href="/register" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-brand px-7 font-semibold text-brand-ink">Start the sheet — free <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/login" className="font-semibold text-muted hover:text-fg">Browse it first →</Link></div>
        <p className="mt-4 text-sm text-faint">No card. The first pattern takes about 10 minutes.</p>
      </section>
      <PatternPreview />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Four tracks, <span className="text-brand">one sequence</span></h2>
        <p className="mt-3 max-w-xl text-muted">Each section picks up where the last leaves off, so you always know what to open next instead of tab-hopping across five sites.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{TRACKS.map(({ icon: I, tag, title, body, href }) => (
          <Link key={title} href={href} className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand/40"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand"><I className="h-5 w-5" /></span><span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">{tag}</span></div>
            <h3 className="mt-6 text-xl font-bold">{title}</h3><p className="mt-2 flex-1 text-sm text-muted">{body}</p><span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-brand">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span></Link>))}</div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Three habits, <span className="text-brand">repeated</span></h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">{HABITS.map(({ icon: I, title, body }) => (<div key={title} className="rounded-2xl border border-line bg-surface p-6"><I className="h-6 w-6 text-brand" /><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-2 text-sm text-muted">{body}</p></div>))}</div>
      </section>
      <Courses />
      <Testimonials />
      <Community />
      <section className="mx-auto max-w-3xl px-6 py-20 text-center"><h2 className="text-4xl font-extrabold tracking-tight">Ready to start the <span className="text-brand">first pattern?</span></h2>
        <Link href="/register" className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-brand px-6 font-semibold text-brand-ink">Create your free account <BookOpenCheck className="h-4 w-4" /></Link></section>
      <Founder />
      <LandingFooter />
    </div>
  );
}
