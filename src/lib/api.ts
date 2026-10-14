export function normalizeApiUrl(value: string | undefined) {
  const base = (value || "").replace(/\/+$/, "");
  if (!base || /\/api\/v1$/i.test(base)) return base;
  return `${base}/api/v1`;
}

export function resolveApiUrl(value: string | undefined, useSameOriginProxy = false) {
  return useSameOriginProxy ? "/api/v1" : normalizeApiUrl(value);
}

export const API_URL = resolveApiUrl(process.env.NEXT_PUBLIC_API_URL, process.env.NEXT_PUBLIC_API_PROXY === "true");

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) { super(message); }
}

export const STATUS_MESSAGES: Record<number, string> = {
  401: "Your session has expired. Please sign in again.",
  403: "You don't have access to this content.",
  404: "We couldn't find what you were looking for.",
  409: "That conflicts with existing data. Refresh and try again.",
  429: "Too many requests. Wait a moment and try again.",
  500: "Something went wrong on our side. Try again shortly.",
};

type Opts = { method?: string; body?: unknown; query?: Record<string, unknown>; signal?: AbortSignal; silent401?: boolean };

function qs(q?: Record<string, unknown>) {
  if (!q) return "";
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "" && v !== false) p.set(k, String(v)); });
  const s = p.toString();
  return s ? `?${s}` : "";
}

let refreshing: Promise<boolean> | null = null;
async function tryRefresh() {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include" })
    .then((r) => r.ok).catch(() => false).finally(() => { setTimeout(() => (refreshing = null), 0); });
  return refreshing;
}

export async function api<T = unknown>(path: string, opts: Opts = {}, retried = false): Promise<T> {
  if (!API_URL) throw new ApiError(0, "NEXT_PUBLIC_API_URL is not configured.");
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}${qs(opts.query)}`, {
      method: opts.method || (opts.body ? "POST" : "GET"),
      credentials: "include", // httpOnly cookies set by the backend; nothing sensitive in JS-readable storage
      signal: opts.signal,
      headers: isForm ? undefined : { "Content-Type": "application/json", Accept: "application/json" },
      body: opts.body === undefined ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
    });
  } catch {
    throw new ApiError(0, "Network error. Check your connection (the server may be waking up — retry in a few seconds).");
  }
  if (res.status === 401 && !retried && !/^\/(admin\/)?auth\/(login|register|refresh|logout|forgot-password|reset-password)/.test(path)) {
    if (await tryRefresh()) return api<T>(path, opts, true);
  }
  if (!res.ok) {
    let data: any; try { data = await res.json(); } catch {}
    const err = new ApiError(res.status, data?.error?.message || data?.message || STATUS_MESSAGES[res.status] || `Request failed (${res.status})`, data);
    if (typeof window !== "undefined" && res.status === 401 && !opts.silent401) window.dispatchEvent(new CustomEvent("rb:unauthorized"));
    if (typeof window !== "undefined" && (res.status === 429 || res.status >= 500))
      window.dispatchEvent(new CustomEvent("rb:api-error", { detail: err.message }));
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const get = <T,>(path: string, query?: Record<string, unknown>, signal?: AbortSignal) => api<T>(path, { query, signal });
export const post = <T,>(path: string, body?: unknown) => api<T>(path, { method: "POST", body: body ?? {} });
export const put = <T,>(path: string, body?: unknown) => api<T>(path, { method: "PUT", body });
export const patch = <T,>(path: string, body?: unknown) => api<T>(path, { method: "PATCH", body });
export const del = <T,>(path: string) => api<T>(path, { method: "DELETE" });
export const upload = <T,>(path: string, form: FormData, method = "POST") => api<T>(path, { method, body: form });

export const oauthUrl = (provider: "google" | "github") => `${API_URL}/auth/oauth/${provider}`;
