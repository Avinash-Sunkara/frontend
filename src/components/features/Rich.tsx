"use client";
import { useMemo } from "react";

/** Renders backend-authored HTML. The backend MUST sanitize on write (allow-list); we strip scripts/handlers again defensively. */
export function sanitize(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/javascript:/gi, "");
}
export function Rich({ html, className = "" }: { html: string; className?: string }) {
  const clean = useMemo(() => sanitize(html || ""), [html]);
  return <div className={`prose-rb ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
export function youtubeEmbed(url?: string) {
  const m = url?.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/); return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}
