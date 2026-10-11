"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { post } from "@/lib/api";

function Inner() {
  const token = useSearchParams().get("token"); const [state, setState] = useState<"working" | "ok" | "bad">(token ? "working" : "bad"); const ran = useRef(false);
  useEffect(() => {
    if (!token || ran.current) return; ran.current = true;
    post("/auth/verify-email", { token }).then(() => setState("ok")).catch(() => setState("bad"));
  }, [token]);
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center"><div className="max-w-sm space-y-3">
      <h1 className="text-xl font-bold">{state === "ok" ? "Email verified" : state === "bad" ? "This link didn't work" : "Verifying your email…"}</h1>
      {state === "bad" && <p className="text-sm text-muted">The link is invalid or has expired. Sign in and request a new verification email.</p>}
      {state !== "working" && <Link href={state === "ok" ? "/dashboard" : "/login"} className="inline-block font-semibold text-brand">{state === "ok" ? "Continue" : "Back to sign in"}</Link>}
    </div></div>);
}
export default function Page() { return <Suspense><Inner /></Suspense>; }
