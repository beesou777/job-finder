/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["kamkhoj.eventeir.ai"],
  },
  experimental: {
    serverComponentsExternalPackages: ["typeorm"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "kamkhoj.com" }],
        destination: "https://www.kamkhoj.com/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Server-only: the backend host lives only here (never NEXT_PUBLIC_*),
    // so it never ships to the browser bundle or appears in DevTools.
    const backendUrl =
      process.env.INTERNAL_API_URL ||
      process.env.BACKEND_API_URL ||
      "http://localhost:4000/api";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        // Never index raw JSON; only rendered pages are crawlable.
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, nosnippet, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
