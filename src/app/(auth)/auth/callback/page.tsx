"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { get } from "@/lib/api";
import { useAuth } from "@/providers/auth";
import type { User } from "@/lib/types";
import { safeInternalPath } from "@/lib/utils";

const MESSAGES: Record<string, string> = {
  access_denied: "Sign-in was cancelled.",
  invalid_state: "That sign-in attempt expired or was opened in a different browser. Please try again.",
  oauth_failed: "The provider didn't complete the sign-in. Please try again.",
  email_unverified: "Your provider did not return a verified email address, so we could not sign you in.",
  account_blocked: "This account is blocked. Contact support.",
  account_suspended: "This account is suspended. Contact support.",
  not_configured: "This sign-in method isn't available yet. Use your email and password instead.",
};

function Inner() {
  const params = useSearchParams(); const router = useRouter(); const { refresh } = useAuth();
  const error = params.get("error"); const [failed, setFailed] = useState(false); const ran = useRef(false);
  useEffect(() => {
    if (error || ran.current) return; // `refresh` changes identity on every render; run the sign-in completion exactly once
    ran.current = true;
    (async () => {
      await get<User>("/auth/me"); // the session cookie must have arrived; if the browser blocked it this throws
      await refresh();
      let next = "/dashboard";
      try { next = sessionStorage.getItem("rb:next") || next; sessionStorage.removeItem("rb:next"); } catch {}
      router.replace(safeInternalPath(next));
    })().catch(() => setFailed(true));
  }, [error, refresh, router]);
  if (error || failed) return (
    <div className="grid min-h-dvh place-items-center p-6 text-center"><div className="max-w-sm space-y-3">
      <h1 className="text-xl font-bold">We couldn&apos;t sign you in</h1>
      <p className="text-sm text-muted">{(error && (MESSAGES[error] ?? "Something went wrong while signing in. Please try again.")) || "We signed you in with your provider, but your browser did not keep the session. Allow cookies for this site and try again."}</p>
      <Link href="/login" className="inline-block font-semibold text-brand">Back to sign in</Link></div></div>);
  return <div className="grid min-h-dvh place-items-center text-sm text-muted">Signing you in…</div>;
}
export default function Page() { return <Suspense><Inner /></Suspense>; }
