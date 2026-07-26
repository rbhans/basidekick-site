import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BASidekick",
    short_name: "BASidekick",
    description: "The public workspace for building automation.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#d11a36",
    icons: [{ src: "/brand/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
