/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["kamkhoj.eventeir.ai"],
  },
  experimental: {
    serverComponentsExternalPackages: ["typeorm"],
    serverActions: { bodySizeLimit: "6mb" },
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
  async headers() {
    return [
      {
        // Keep unknown frontend API paths out of search results.
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
