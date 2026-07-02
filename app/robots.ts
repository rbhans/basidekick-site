import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://basidekick.com";

  return {
    rules: [
      {
        userAgent: "*",
        // Keep the public Atlas API crawlable (it's advertised in llms.txt) while
        // blocking the rest of /api.
        allow: ["/", "/api/atlas"],
        disallow: [
          "/api/",
          "/auth/",
          // No trailing slashes: robots prefix-matching means "/signin/" would
          // NOT match the real "/signin" URL.
          "/account",
          "/admin",
          "/profile",
          "/signin",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/pointstack/messages",
          "/pointstack/notifications",
          "/pointstack/onboarding",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
