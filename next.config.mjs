/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
let apiHost = "";
try { apiHost = new URL(apiUrl).hostname; } catch {}
// Optional same-origin mode: set API_PROXY_TARGET=https://api.example.com and NEXT_PUBLIC_API_URL=/api/v1. The browser then only talks to the
// site's own domain, so sign-in cookies are first-party and survive Safari / Chrome third-party-cookie blocking (e.g. Vercel + Render on different domains).
const proxyTarget = (process.env.API_PROXY_TARGET || "").replace(/\/$/, "");
const nextConfig = {
  // Keep Playwright's dev server out of the .next cache used by a concurrently running local app.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  async rewrites() { return proxyTarget ? [{ source: "/api/:path*", destination: `${proxyTarget}/api/:path*` }] : []; },
  images: {
    remotePatterns: [
      ...(apiHost ? [{ protocol: "https", hostname: apiHost }] : []),
      { protocol: "https", hostname: "**" }, // company logos / admin-supplied assets
    ],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    }];
  },
};
export default nextConfig;
