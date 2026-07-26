import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/account",
        "/admin",
        "/profile",
        "/signin",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/library/submit",
        "/pointstack/messages",
        "/pointstack/notifications",
        "/pointstack/onboarding",
        "/pointstack/new",
        "/pointstack/jobs/new",
        "/wiki/contribute",
      ],
    },
    sitemap: "https://basidekick.com/sitemap.xml",
    host: "https://basidekick.com",
  };
}
