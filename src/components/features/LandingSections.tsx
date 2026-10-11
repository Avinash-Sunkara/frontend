"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Clock, ExternalLink, GraduationCap, Linkedin, Instagram, Youtube, Quote, Star } from "lucide-react";
import { useGet } from "@/hooks/useApi";
import { cn, initials } from "@/lib/utils";
import { BRAND } from "@/config/brand";
import type { Course } from "@/lib/types";
import { ApiError } from "@/lib/api";
import { PatternVisualizer } from "@/components/features/PatternVisualizer";
import type { PatternName } from "@/components/features/patternAlgorithms";

/* ---------- Product preview: pattern → problems (illustrative UI, not product data) ---------- */
const PATTERNS = [
  { name: "Sliding Window", cue: "“window of size k”, “longest”, “shortest”, or “at most K”", tag: "Array", span: [2, 4], problems: ["Max Consecutive Ones III", "Subarray Product Less Than K", "Longest Repeating Character Replacement"] },
  { name: "Monotonic Stack", cue: "“next greater”, “previous smaller”, or span/histogram questions", tag: "Stack", span: [1, 3], problems: ["Daily Temperatures", "Largest Rectangle in Histogram", "Next Greater Element II"] },
  { name: "Binary Search on Answers", cue: "“minimise the maximum” or “smallest value that works”", tag: "Search", span: [3, 6], problems: ["Koko Eating Bananas", "Capacity To Ship Packages", "Split Array Largest Sum"] },
  { name: "Kadane's Algorithm", cue: "“maximum subarray” or best contiguous run", tag: "DP", span: [0, 5], problems: ["Maximum Subarray", "Maximum Product Subarray", "Best Sightseeing Pair"] },
  { name: "Prefix Sum", cue: "repeated range-sum queries or “subarray sum equals k”", tag: "Array", span: [1, 2], problems: ["Subarray Sum Equals K", "Range Sum Query", "Continuous Subarray Sum"] },
  { name: "Two-Pointer", cue: "sorted arrays, pairs, triplets, or opposite-end traversal", tag: "Array", span: [0, 7], problems: ["Two Sum II", "3Sum", "Container With Most Water"] },
] satisfies { name: PatternName; cue: string; tag: string; span: [number, number]; problems: string[] }[];
export function PatternPreview() {
  const [i, setI] = useState(0); const p = PATTERNS[i];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line bg-raised/50 px-4 py-3"><span className="h-3 w-3 rounded-full bg-line" /><span className="h-3 w-3 rounded-full bg-line" /><span className="h-3 w-3 rounded-full bg-line" /><span className="ml-3 font-mono text-xs text-muted">pattern → problems</span></div>
        <div className="grid gap-6 p-5 md:grid-cols-[240px_1fr]">
          <div role="tablist" aria-label="DSA algorithm patterns" className="flex gap-1 overflow-x-auto md:flex-col">{PATTERNS.map((x, k) => (
            <button key={x.name} ref={(element) => { tabRefs.current[k] = element; }} id={`pattern-tab-${k}`} role="tab" aria-controls="pattern-details" aria-selected={k === i} tabIndex={k === i ? 0 : -1} onClick={() => setI(k)} onKeyDown={(event) => {
              const next = event.key === "ArrowRight" ? (k + 1) % PATTERNS.length
                : event.key === "ArrowLeft" ? (k + PATTERNS.length - 1) % PATTERNS.length
                  : event.key === "Home" ? 0
                    : event.key === "End" ? PATTERNS.length - 1 : -1;
              if (next >= 0) {
                event.preventDefault();
                setI(next);
                tabRefs.current[next]?.focus();
              }
            }} className={cn("whitespace-nowrap rounded-xl border-l-2 px-4 py-3 text-left text-sm", k === i ? "border-brand bg-raised font-semibold" : "border-transparent text-muted hover:text-fg")}>{x.name}</button>))}</div>
          <div id="pattern-details" role="tabpanel" aria-labelledby={`pattern-tab-${i}`} tabIndex={0} className="min-w-0">
            <div className="flex justify-center gap-2 rounded-2xl border border-line p-6" aria-hidden>{Array.from({ length: 8 }).map((_, k) => (
              <span key={k} className={cn("grid h-12 w-12 place-items-center rounded-lg border transition-colors sm:h-14 sm:w-14", k >= p.span[0] && k <= p.span[1] ? "border-brand bg-brand/15" : "border-line bg-raised")}><span className={cn("h-1 w-5 rounded", k >= p.span[0] && k <= p.span[1] ? "bg-brand" : "bg-faint")} /></span>))}</div>
            <p className="mt-5 text-xs font-semibold text-muted">When a problem mentions</p>
            <p className="mt-1 text-xl font-bold">{p.cue}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted">reach for <b className="text-brand">{p.name}</b><span className="rounded-full border border-line px-2 py-0.5 text-xs">{p.tag}</span></p>
            <div className="mt-4 flex flex-wrap gap-2">{p.problems.map((x) => <span key={x} className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs">{x}</span>)}</div>
            <PatternVisualizer key={p.name} pattern={p.name} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials: real ones only, from the backend ---------- */
interface T { id: string; name: string; handle?: string; location?: string; quote: string; rating?: number; avatarUrl?: string }
export function Testimonials() {
  const q = useGet<T[]>("/public/testimonials", undefined, { staleTime: 10 * 60_000 });
  if (!q.data?.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center"><h2 className="text-4xl font-extrabold tracking-tight">What our <span className="text-brand">students say</span></h2><p className="mt-2 text-muted">Real messages from learners.</p></div>
      <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4">{q.data.map((t) => (
        <figure key={t.id} className="w-[300px] shrink-0 snap-start rounded-2xl border border-line bg-surface p-6 sm:w-[340px]">
          <Quote className="h-6 w-6 text-brand/60" /><blockquote className="mt-3 text-sm leading-relaxed text-muted">“{t.quote}”</blockquote>
          <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand to-emerald-700 text-xs font-bold text-white">{initials(t.name)}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{t.name}</span><span className="block truncate text-xs text-brand">{t.handle || t.location}</span></span>
            <span className="flex text-brand" aria-label={`${t.rating ?? 5} stars`}>{Array.from({ length: t.rating ?? 5 }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-brand" />)}</span>
          </figcaption></figure>))}</div>
    </section>
  );
}

/* ---------- Courses: published ones from the backend; hidden when there are none ---------- */
export function Courses() {
  const q = useGet<Course[]>("/public/courses", undefined, { staleTime: 30_000 });
  if (q.isError) return <p role="alert" className="mx-auto max-w-6xl px-6 py-8 text-sm text-hard">Courses are temporarily unavailable. Please try again later.</p>;
  if (!q.data?.length) return null;
  return (
    <section id="courses" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Our <span className="text-brand">courses</span></h2>
      <p className="mt-3 max-w-xl text-muted">Structured programmes for when you want a guided path on top of the free tracks.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{q.data.map((c) => {
        const label = c.ctaLabel || "Learn more";
        const cta = "mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink";
        return (
          <article key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="relative aspect-[16/9] bg-raised">
              {c.thumbnailUrl ? <Image src={c.thumbnailUrl} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
                : <span className="absolute inset-0 grid place-items-center text-brand/50"><GraduationCap className="h-10 w-10" /></span>}
            </div>
            <div className="flex flex-1 flex-col p-5">
              {(c.level || c.duration) && <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                {c.level && <span className="rounded-full border border-line px-2.5 py-0.5">{c.level}</span>}
                {c.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.duration}</span>}</div>}
              <h3 className="mt-3 text-xl font-bold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted">{c.description}</p>
              {c.highlights.length > 0 && <ul className="mt-4 space-y-1.5 text-sm">{c.highlights.map((h, k) => <li key={k} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /><span>{h}</span></li>)}</ul>}
              <div className="mt-auto pt-2">
                {c.priceLabel && <p className="mt-4 text-lg font-extrabold">{c.priceLabel}</p>}
                {c.ctaUrl ? <a href={c.ctaUrl} target="_blank" rel="noopener noreferrer" className={cta}>{label} <ExternalLink className="h-4 w-4" /></a>
                  : <Link href="/register" className={cta}>{c.ctaLabel || "Get started"}</Link>}
              </div>
            </div>
          </article>);
      })}</div>
    </section>
  );
}

/* ---------- Community links: configured via env ---------- */
export function Community() {
  const links = [
    { name: "LinkedIn", href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN, icon: Linkedin, color: "text-sky-400 bg-sky-500/10" },
    { name: "YouTube", href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE, icon: Youtube, color: "text-red-400 bg-red-500/10" },
    { name: "Instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM, icon: Instagram, color: "text-pink-400 bg-pink-500/10" },
  ].filter((l) => !!l.href);
  if (!links.length) return null;
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 text-center">
      <h2 className="text-4xl font-extrabold tracking-tight">Learn with the <span className="text-brand">community</span></h2>
      <p className="mx-auto mt-2 max-w-lg text-muted">Free daily breakdowns, placement strategy and people who keep you accountable. Pick a platform and follow along.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">{links.map(({ name, href, icon: I, color }) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-line bg-surface p-5 text-left transition-colors hover:border-brand/40">
          <span className="flex items-center gap-3"><span className={cn("grid h-11 w-11 place-items-center rounded-xl", color)}><I className="h-5 w-5" /></span><span className="font-bold">{name}</span></span><ExternalLink className="h-4 w-4 text-faint" /></a>))}</div>
    </section>
  );
}

/* ---------- Founder / about: content from backend, hidden when not configured ---------- */
interface F { name: string; title: string; photoUrl?: string; bio: string[]; previously?: string[]; stats?: { label: string; value: string }[]; socialLinks?: { label: string; url: string }[]; contactEmail?: string; copyrightText?: string; ctaLabel?: string; ctaUrl?: string }
export function Founder() {
  const q = useGet<F>("/public/founder", undefined, { staleTime: 30_000 });
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => setPhotoFailed(false), [q.data?.photoUrl]);
  if (q.isError && !(q.error instanceof ApiError && q.error.status === 404)) {
    return <p role="alert" className="mx-auto max-w-6xl px-6 py-8 text-sm text-hard">Founder information is temporarily unavailable.</p>;
  }
  const f = q.data; if (!f) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid overflow-hidden rounded-3xl border border-line bg-surface md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative min-h-[320px] bg-gradient-to-br from-raised to-brand/10">{f.photoUrl && !photoFailed && <Image src={f.photoUrl} alt={f.name} fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" onError={() => setPhotoFailed(true)} />}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6"><p className="text-xl font-bold text-white">{f.name}</p><p className="text-sm text-brand">{f.title}</p></div></div>
        <div className="space-y-4 p-6 sm:p-10">
          <h2 className="text-3xl font-extrabold tracking-tight">Hi, I&apos;m <span className="text-brand">{f.name.split(" ")[0]}</span></h2>
          {f.bio?.map((b, k) => <p key={k} className="text-muted">{b}</p>)}
          {!!f.previously?.length && <div className="border-t border-line pt-4"><p className="text-xs font-semibold text-faint">Previously</p><p className="mt-1 font-semibold">{f.previously.join("  ·  ")}</p></div>}
          {!!f.stats?.length && <div className="grid grid-cols-2 gap-3">{f.stats.map((s) => <div key={s.label} className="rounded-xl border border-line p-4"><p className="text-xl font-extrabold">{s.value}</p><p className="text-xs text-muted">{s.label}</p></div>)}</div>}
          {!!f.socialLinks?.length && <div className="flex flex-wrap gap-2">{f.socialLinks.map((link) => <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:border-brand/40 hover:text-brand">{link.label}<ExternalLink className="ml-1 inline h-3 w-3" /></a>)}</div>}
          {f.contactEmail && <a href={`mailto:${f.contactEmail}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand">{f.contactEmail}</a>}
          {f.ctaUrl && <Link href={f.ctaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink">{f.ctaLabel ?? "Connect"} <ExternalLink className="h-4 w-4" /></Link>}
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const q = useGet<F>("/public/founder", undefined, { staleTime: 30_000 });
  return <footer className="border-t border-line py-8 text-center text-sm text-faint">
    {q.data?.copyrightText ?? `© ${new Date().getFullYear()} ${BRAND.name}`}
    {" · "}<Link href="/terms" className="hover:text-fg">Terms</Link>
    {" · "}<Link href="/privacy" className="hover:text-fg">Privacy</Link>
  </footer>;
}
