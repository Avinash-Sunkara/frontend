"use client";

import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play, RotateCcw, StepBack, StepForward } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALGORITHM_COMPLEXITY,
  createAlgorithmSteps,
  parseArrayInput,
  PATTERN_DEFAULTS,
  type AlgorithmOptions,
  type AlgorithmStep,
  type PatternName,
  type PointerKind,
} from "./patternAlgorithms";

const POINTER_STYLES: Record<PointerKind, { card: string; badge: string }> = {
  left: { card: "border-sky-400 bg-sky-400/10", badge: "bg-sky-500 text-white" },
  right: { card: "border-violet-400 bg-violet-400/10", badge: "bg-violet-500 text-white" },
  current: { card: "border-amber-400 bg-amber-400/10", badge: "bg-amber-500 text-white" },
  mid: { card: "border-amber-400 bg-amber-400/10", badge: "bg-amber-500 text-white" },
  low: { card: "border-sky-400 bg-sky-400/10", badge: "bg-sky-500 text-white" },
  high: { card: "border-violet-400 bg-violet-400/10", badge: "bg-violet-500 text-white" },
};

const PARAM_LABELS: Partial<Record<PatternName, { first: string; second?: string }>> = {
  "Sliding Window": { first: "Window size (k)" },
  "Binary Search on Answers": { first: "Hours available" },
  "Prefix Sum": { first: "Range start index", second: "Range end index" },
  "Two-Pointer": { first: "Target sum" },
};

function describePointer(kind: PointerKind) {
  return { left: "Left pointer", right: "Right pointer", current: "Current element", mid: "Midpoint", low: "Low bound", high: "High bound" }[kind];
}

export function PatternVisualizer({ pattern }: { pattern: PatternName }) {
  const defaults = PATTERN_DEFAULTS[pattern];
  const [array, setArray] = useState(defaults.array);
  const [options, setOptions] = useState<AlgorithmOptions>({ first: defaults.first, second: defaults.second });
  const [arrayInput, setArrayInput] = useState(defaults.array.join(", "));
  const [firstInput, setFirstInput] = useState(String(defaults.first));
  const [secondInput, setSecondInput] = useState(String(defaults.second));
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reducedMotion = useReducedMotion();
  const steps = useMemo(() => createAlgorithmSteps(pattern, array, options), [pattern, array, options]);
  const step = steps[stepIndex] ?? steps[0];
  const labels = PARAM_LABELS[pattern];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (stepIndex >= steps.length - 1) setPlaying(false);
      else setStepIndex(stepIndex + 1);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [playing, stepIndex, steps.length]);

  function applyInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const nextArray = parseArrayInput(arrayInput);
      if ((labels?.first && firstInput.trim() === "") || (labels?.second && secondInput.trim() === "")) {
        throw new Error("Enter a value for every algorithm parameter.");
      }
      const nextOptions = { first: labels?.first ? Number(firstInput) : 0, second: labels?.second ? Number(secondInput) : 0 };
      if ((labels?.first && !Number.isSafeInteger(nextOptions.first)) || (labels?.second && !Number.isSafeInteger(nextOptions.second))) {
        throw new Error("Algorithm parameters must be whole numbers.");
      }
      createAlgorithmSteps(pattern, nextArray, nextOptions);
      setArray(nextArray);
      setOptions(nextOptions);
      setStepIndex(0);
      setPlaying(false);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to use this input.");
    }
  }

  function handleKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPlaying(false);
      setStepIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPlaying(false);
      setStepIndex((index) => Math.min(steps.length - 1, index + 1));
    } else if (event.key === " ") {
      event.preventDefault();
      setPlaying((current) => !current && stepIndex < steps.length - 1);
    }
  }

  function reset() {
    setPlaying(false);
    setStepIndex(0);
  }

  const complexity = ALGORITHM_COMPLEXITY[pattern];

  return (
    <div
      className="mt-6 rounded-2xl border border-line bg-bg/60 p-4 sm:p-5"
      role="group"
      aria-label={`${pattern} interactive visualization`}
      tabIndex={0}
      onKeyDown={handleKeyboard}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Algorithm in action</p>
          <h3 className="mt-1 text-lg font-bold">{pattern === "Sliding Window" ? "Maximum sum subarray of size k" : pattern === "Monotonic Stack" ? "Next greater element" : pattern === "Binary Search on Answers" ? "Minimum feasible eating speed" : pattern === "Kadane's Algorithm" ? "Maximum subarray" : pattern === "Prefix Sum" ? "Build prefixes · range-sum query" : "Find a pair for the target sum"}</h3>
        </div>
        <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">Step {stepIndex + 1} of {steps.length}</span>
      </div>

      <form onSubmit={applyInput} className="mt-4 grid gap-3 rounded-xl border border-line bg-surface p-3 sm:grid-cols-[minmax(180px,1fr)_auto] sm:items-end">
        <label className="block min-w-0 text-xs font-medium text-muted">
          Input array <span className="text-faint">(2–12 integers)</span>
          <input value={arrayInput} onChange={(event) => setArrayInput(event.target.value)} aria-label="Input array" className="mt-1.5 h-10 w-full rounded-lg border border-line bg-bg px-3 font-mono text-sm text-fg outline-none transition focus:border-brand" />
        </label>
        <div className="flex flex-wrap items-end gap-2">
          {labels && <label className="block text-xs font-medium text-muted">
            {labels.first}
            <input type="number" value={firstInput} onChange={(event) => setFirstInput(event.target.value)} aria-label={labels.first} className="mt-1.5 h-10 w-32 rounded-lg border border-line bg-bg px-3 font-mono text-sm text-fg outline-none transition focus:border-brand" />
          </label>}
          {labels?.second && <label className="block text-xs font-medium text-muted">
            {labels.second}
            <input type="number" value={secondInput} onChange={(event) => setSecondInput(event.target.value)} aria-label={labels.second} className="mt-1.5 h-10 w-32 rounded-lg border border-line bg-bg px-3 font-mono text-sm text-fg outline-none transition focus:border-brand" />
          </label>}
          <button type="submit" className="h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink transition hover:brightness-95">Run input</button>
        </div>
        {error && <p role="alert" className="text-sm text-hard sm:col-span-2">{error}</p>}
      </form>

      <div className="mt-4 rounded-xl border border-line bg-surface p-3 sm:p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Input array <span className="font-normal normal-case tracking-normal text-faint">· indexes start at 0</span></p>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-2.5" role="list" aria-label="Array values">
          {array.map((value, index) => {
            const pointers = step.pointers.filter((pointer) => pointer.index === index);
            const isActive = step.activeIndices.includes(index);
            const isInWindow = step.window && index >= step.window[0] && index <= step.window[1];
            const stackTop = step.stack?.[step.stack.length - 1] === index;
            const borderStyle = pointers.length ? POINTER_STYLES[pointers[0].kind].card : stackTop ? "border-amber-400 bg-amber-400/10" : isInWindow ? "border-brand bg-brand/10" : isActive ? "border-brand/60 bg-brand/5" : "border-line bg-bg";
            return (
              <motion.div
                key={index}
                layout={!reducedMotion}
                transition={{ layout: { duration: reducedMotion ? 0 : 0.22 } }}
                role="listitem"
                aria-label={`Index ${index}, value ${value}${pointers.length ? `, ${pointers.map((pointer) => describePointer(pointer.kind)).join(" and ")}` : ""}${isInWindow ? ", in active range" : ""}`}
                className={cn("relative flex min-h-[76px] min-w-0 flex-col items-center justify-end rounded-xl border px-2 pb-2 pt-6 transition-colors duration-200 sm:min-w-[68px]", borderStyle)}
              >
                {pointers.length > 0 && <motion.span layoutId={`pointer-${pointers[0].kind}`} layout={!reducedMotion} transition={{ layout: { duration: reducedMotion ? 0 : 0.24 } }} className={cn("absolute -top-2.5 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-tight", POINTER_STYLES[pointers[0].kind].badge)}>{pointers.map((pointer) => pointer.label).join(" · ")}</motion.span>}
                <span className="font-mono text-base font-bold tabular-nums">{value}</span>
                <span className="mt-1 font-mono text-[10px] text-faint">{index}</span>
              </motion.div>
            );
          })}
        </div>

        {step.search && <div className="mt-5 rounded-lg bg-bg px-3 py-3" aria-label="Binary search speed range">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-muted">Candidate speed range</span>
            <span className="font-mono text-muted">low {step.search.low} <span className="text-faint">·</span> mid {step.search.mid} <span className="text-faint">·</span> high {step.search.high}</span>
          </div>
          <div className="relative mx-1 mt-3 h-9">
            <div className="absolute inset-x-0 top-3 h-1 rounded-full bg-line" />
            <div className="absolute top-3 h-1 rounded-full bg-brand/50" style={{ left: `${(step.search.low / Math.max(1, ...array)) * 100}%`, width: `${((step.search.high - step.search.low) / Math.max(1, ...array)) * 100}%` }} />
            {(["low", "mid", "high"] as const).map((kind) => {
              const value = step.search![kind];
              const left = (value / Math.max(1, ...array)) * 100;
              return <span key={kind} className={cn("absolute top-0 -translate-x-1/2 font-mono text-[10px] font-bold", kind === "mid" ? "text-amber-500" : kind === "low" ? "text-sky-500" : "text-violet-500")} style={{ left: `${left}%` }} aria-label={`${kind}: ${value}`}>{kind === "mid" ? "▼" : "•"} {value}</span>;
            })}
            <span className="absolute bottom-0 left-0 font-mono text-[10px] text-faint">1</span>
            <span className="absolute bottom-0 right-0 font-mono text-[10px] text-faint">{Math.max(...array)}</span>
          </div>
          {step.search.feasible !== undefined && <p className={cn("text-xs font-semibold", step.search.feasible ? "text-brand" : "text-hard")}>{step.search.feasible ? "Feasible — move high left" : "Not feasible — move low right"}</p>}
        </div>}

        {pattern === "Monotonic Stack" && <div className="mt-4 rounded-lg bg-bg p-3">
          <div className="flex items-center justify-between text-xs"><span className="font-semibold text-muted">Stack <span className="font-normal">(bottom → top)</span></span><span className="text-faint">{step.stack?.length ?? 0} items</span></div>
          <div className="mt-2 flex min-h-12 flex-wrap items-end gap-2" aria-label="Stack contents">
            {step.stack?.length ? step.stack.map((index, position) => <motion.span key={index} layout={!reducedMotion} transition={{ layout: { duration: reducedMotion ? 0 : 0.2 } }} className={cn("flex h-10 min-w-12 items-center justify-center gap-1 rounded-lg border px-2 font-mono text-xs", position === step.stack!.length - 1 ? "border-amber-400 bg-amber-400/10 text-fg" : "border-line bg-surface text-muted")} aria-label={`Stack value ${array[index]} at index ${index}${position === step.stack!.length - 1 ? ", stack top" : ""}`}><span>{array[index]}</span><span className="text-faint">#{index}</span>{position === step.stack!.length - 1 && <span className="text-amber-500">top</span>}</motion.span>) : <span className="text-xs text-faint">Empty stack</span>}
          </div>
        </div>}

        {step.prefix && <div className="mt-4 rounded-lg bg-bg p-3">
          <p className="mb-2 text-xs font-semibold text-muted">Prefix sums <span className="font-normal text-faint">(prefix[i] = sum before index i)</span></p>
          <div className="flex flex-wrap gap-2" aria-label="Prefix sum values">
            {step.prefix.map((value, index) => <motion.span key={index} layout={!reducedMotion} transition={{ layout: { duration: reducedMotion ? 0 : 0.2 } }} className={cn("flex min-h-12 min-w-12 flex-col items-center justify-center rounded-lg border px-2 font-mono", step.window && index >= step.window[0] && index <= step.window[1] + 1 ? "border-brand bg-brand/10" : "border-line bg-surface")} aria-label={`Prefix index ${index}, value ${value}`}><span className="text-sm font-bold">{value}</span><span className="text-[10px] text-faint">{index}</span></motion.span>)}
          </div>
        </div>}

        {step.values && <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(step.values).map(([label, value]) => <div key={label} className="rounded-lg border border-line bg-bg px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">{label}</p>
            <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums">{value}</p>
          </div>)}
        </div>}
      </div>

      <div className="mt-3 min-h-[82px] rounded-xl border border-line bg-surface p-3 sm:p-4" aria-live="polite" aria-atomic="true">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">What happens</p>
          <span className="text-[11px] text-faint">← → step · Space play</span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={stepIndex} initial={reducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: reducedMotion ? 0 : 0.16 }} className="mt-2 text-sm leading-relaxed text-fg">{step.explanation}</motion.p>
        </AnimatePresence>
      </div>

      {step.result && <div className="mt-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
        <p className="text-sm font-bold text-brand">{step.result.title}</p>
        <p className="mt-1 text-sm text-muted">{step.result.detail}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-brand/15 pt-3 text-xs"><span><span className="text-faint">Time </span><b className="font-mono">{complexity.time}</b></span><span><span className="text-faint">Space </span><b className="font-mono">{complexity.space}</b></span></div>
      </div>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" aria-label="Reset visualization" onClick={reset} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:border-brand/50 hover:text-fg"><RotateCcw className="h-4 w-4" /></button>
        <button type="button" aria-label="Previous step" disabled={stepIndex === 0} onClick={() => { setPlaying(false); setStepIndex((index) => Math.max(0, index - 1)); }} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:border-brand/50 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"><StepBack className="h-4 w-4" /></button>
        <button type="button" aria-label={playing ? "Pause visualization" : "Play visualization"} onClick={() => { if (stepIndex === steps.length - 1) setStepIndex(0); setPlaying((current) => !current); }} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink transition hover:brightness-95">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{playing ? "Pause" : "Play"}
        </button>
        <button type="button" aria-label="Next step" disabled={stepIndex === steps.length - 1} onClick={() => { setPlaying(false); setStepIndex((index) => Math.min(steps.length - 1, index + 1)); }} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:border-brand/50 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"><StepForward className="h-4 w-4" /></button>
        <span className="ml-auto text-xs text-faint">Step through the algorithm</span>
      </div>
      <input type="range" min={0} max={steps.length - 1} value={stepIndex} aria-label="Visualization progress" aria-valuetext={`Step ${stepIndex + 1} of ${steps.length}`} onChange={(event) => { setPlaying(false); setStepIndex(Number(event.target.value)); }} className="mt-3 h-1.5 w-full cursor-pointer accent-brand" />
    </div>
  );
}
