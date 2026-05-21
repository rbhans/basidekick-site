import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      "remark-frontmatter",
      ["remark-mdx-frontmatter", { name: "frontmatter" }],
    ],
    rehypePlugins: [],
  },
});

// Content Security Policy
// Adjust these based on your needs
const cspDirectives = [
  "default-src 'self'",
  // Scripts: self + inline for Next.js + eval for dev
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
  // Styles: self + inline for styled-jsx and CSS-in-JS
  "style-src 'self' 'unsafe-inline'",
  // Images: self + data URIs + Supabase storage + Google favicons
  "img-src 'self' data: blob: https://*.supabase.co https://www.google.com",
  // Fonts: self + Google Fonts
  "font-src 'self' data:",
  // Connect: self + Supabase + Google OAuth + Weather API + GitHub raw
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://api.open-meteo.com https://raw.githubusercontent.com",
  // Frames: YouTube embeds
  "frame-src 'self' https://www.youtube.com https://youtube.com",
  // Object/media
  "object-src 'none'",
  "media-src 'self'",
  // Form actions
  "form-action 'self'",
  // Base URI
  "base-uri 'self'",
  // Frame ancestors (replaces X-Frame-Options)
  "frame-ancestors 'none'",
];

const nextConfig: NextConfig = {
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/api/atlas": ["./data/bas-atlas.db"],
    "/api/atlas/stats": ["./data/bas-atlas.db"],
    "/api/atlas/points": ["./data/bas-atlas.db"],
    "/api/atlas/points/[id]": ["./data/bas-atlas.db"],
    "/api/atlas/equipment": ["./data/bas-atlas.db"],
    "/api/atlas/equipment-detail/[id]": ["./data/bas-atlas.db"],
    "/api/atlas/brands": ["./data/bas-atlas.db"],
    "/api/atlas/types": ["./data/bas-atlas.db"],
    "/api/atlas/models": ["./data/bas-atlas.db"],
    "/api/atlas/models/[id]": ["./data/bas-atlas.db"],
    "/api/atlas/search": ["./data/bas-atlas.db"],
    "/api/atlas/graph": ["./data/bas-atlas.db"],
    "/api/atlas/babel": ["./data/bas-atlas.db"],
    "/api/atlas/babel/categories": ["./data/bas-atlas.db"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/babel",
        destination: "/atlas",
        permanent: true,
      },
      {
        source: "/babel/:path*",
        destination: "/atlas/:path*",
        permanent: true,
      },
      {
        source: "/equipment",
        destination: "/atlas?tab=equipment",
        permanent: true,
      },
      {
        source: "/equipment/:path*",
        destination: "/atlas/equipment/:path*",
        permanent: true,
      },
      {
        source: "/resources/babel",
        destination: "/atlas",
        permanent: true,
      },
      {
        source: "/resources/babel/:path*",
        destination: "/atlas/:path*",
        permanent: true,
      },
      {
        source: "/ssk",
        destination: "/tools/ssk",
        permanent: true,
      },
      {
        source: "/qsk",
        destination: "/tools/qsk",
        permanent: true,
      },
      {
        source: "/nsk",
        destination: "/tools",
        permanent: true,
      },
      {
        source: "/msk",
        destination: "/tools",
        permanent: true,
      },
      {
        source: "/tools/nsk",
        destination: "/tools",
        permanent: true,
      },
      {
        source: "/tools/msk",
        destination: "/tools",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // CORS for public Atlas API
        source: "/api/atlas/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withMDX(nextConfig));
