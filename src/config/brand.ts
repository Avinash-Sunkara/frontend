/** Single source of truth for branding + legal identity. Everything is overridable with NEXT_PUBLIC_* env vars. */
const env = (k: string, d: string) => (process.env[k] ?? "").trim() || d;
const name = env("NEXT_PUBLIC_BRAND_NAME", "CodeWithAws");
const accent = env("NEXT_PUBLIC_BRAND_ACCENT", "Aws"); // the part of the name shown in the green accent colour
const split = name.endsWith(accent) ? [name.slice(0, name.length - accent.length), accent] : [name, ""];

let stats: { value: string; label: string }[] = [];
try { stats = JSON.parse(env("NEXT_PUBLIC_BRAND_STATS", "[]")); } catch { stats = []; }

export const BRAND = {
  name, parts: split as [string, string],
  tagline: env("NEXT_PUBLIC_BRAND_TAGLINE", "Crack your dream product company from any college."),
  description: env("NEXT_PUBLIC_BRAND_DESCRIPTION", "Curated DSA sheets, core CS, aptitude, roadmaps and real interview experiences in one sequence."),
  stats, // e.g. [{"value":"1,200+","label":"Problems"}] — hidden when empty, so you never ship made-up numbers
  legal: {
    entity: env("NEXT_PUBLIC_LEGAL_ENTITY", "[Your registered business name]"),
    address: env("NEXT_PUBLIC_LEGAL_ADDRESS", "[Registered address]"),
    email: env("NEXT_PUBLIC_CONTACT_EMAIL", "support@example.com"),
    grievanceOfficer: env("NEXT_PUBLIC_GRIEVANCE_OFFICER", "[Name of grievance officer]"),
    jurisdiction: env("NEXT_PUBLIC_JURISDICTION", "India"),
    courts: env("NEXT_PUBLIC_COURTS_CITY", "[City]"),
    refundDays: env("NEXT_PUBLIC_REFUND_DAYS", "7"),
    updated: env("NEXT_PUBLIC_LEGAL_UPDATED", "1 January 2026"),
  },
};
