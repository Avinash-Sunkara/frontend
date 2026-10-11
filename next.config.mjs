/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
let apiHost = "";
try { apiHost = new URL(apiUrl).hostname; } catch {}
// Production uses a same-origin proxy by default so browser privacy settings do not
// discard auth cookies between the Vercel site and the separately hosted Render API.
// API_PROXY_TARGET can override the Render origin for previews or other environments.
const proxyTarget = (process.env.API_PROXY_TARGET || (process.env.VERCEL === "1" ? "https://backend-yvzq.onrender.com" : "")).replace(/\/$/, "");
const nextConfig = {
  // Keep Playwright's dev server out of the .next cache used by a concurrently running local app.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  env: { NEXT_PUBLIC_API_PROXY: proxyTarget ? "true" : "false" },
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
