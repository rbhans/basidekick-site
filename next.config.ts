import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Content Security Policy
// Adjust these based on your needs
const cspDirectives = [
  "default-src 'self'",
  // Scripts: self + inline for Next.js + eval for dev
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
  // Styles: self + inline for styled-jsx and CSS-in-JS
  "style-src 'self' 'unsafe-inline'",
  // Images: self + data URIs + Supabase storage + common image sources
  "img-src 'self' data: blob: https://*.supabase.co",
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
  async headers() {
    return [
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
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
