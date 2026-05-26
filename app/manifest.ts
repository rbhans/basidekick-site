import type { MetadataRoute } from "next";

// Next.js auto-serves this at /manifest.webmanifest.
// See https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BASidekick",
    short_name: "BASidekick",
    description:
      "Independent BAS reference, community, and open-source toolkit. Maintained by Rob in Tucson.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#d11a36",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        src: "/apple-icon",
        type: "image/png",
        sizes: "180x180",
      },
      {
        src: "/brand/brandmark-maskable.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "maskable",
      },
    ],
  };
}
