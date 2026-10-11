"use client";
import { oauthUrl } from "@/lib/api";
import { useGet } from "@/hooks/useApi";

const G = () => (<svg viewBox="0 0 48 48" className="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.5-5.8c-2.1 1.4-4.8 2.3-8.1 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>);
const GH = () => (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>);

export function OAuthButtons() {
  const providers = useGet<{ google: boolean; github: boolean }>("/auth/providers", undefined, { staleTime: 10 * 60_000 });
  // Offer only providers the backend has credentials for. If the lookup itself fails, fall back to the env toggles.
  const on = (p: "google" | "github") => process.env[p === "google" ? "NEXT_PUBLIC_ENABLE_GOOGLE" : "NEXT_PUBLIC_ENABLE_GITHUB"] !== "false" && (providers.isError || providers.data?.[p] === true);
  const go = (p: "google" | "github") => {
    const next = new URLSearchParams(window.location.search).get("next");
    try { if (next) sessionStorage.setItem("rb:next", next); else sessionStorage.removeItem("rb:next"); } catch {}
    window.location.href = oauthUrl(p);
  };
  const google = on("google"), github = on("github");
  if (providers.isLoading || (!google && !github)) return null;
  return (
    <>
      <div className={`grid gap-3 ${google && github ? "grid-cols-2" : "grid-cols-1"}`}>
        {google && <button type="button" onClick={() => go("google")} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-neutral-900 hover:bg-neutral-100"><G />Google</button>}
        {github && <button type="button" onClick={() => go("github")} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-raised text-sm font-semibold hover:bg-line"><GH />GitHub</button>}
      </div>
      <div className="my-6 flex items-center gap-4 text-xs text-muted"><span className="h-px flex-1 bg-line" />or continue with email<span className="h-px flex-1 bg-line" /></div>
    </>
  );
}
