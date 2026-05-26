import { ImageResponse } from "next/og";

// Next.js auto-discovers /apple-icon.png from this file at 180x180.
// See https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Crimson card with the BrandMark cutouts — scaled-up favicon.svg.
// iOS applies its own corner mask on top, so we ship a flat crimson fill.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#d11a36",
        }}
      >
        <svg
          width="144"
          height="81"
          viewBox="0 0 32 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="6" width="6" height="6" rx="1" fill="#fafaf8" />
          <path
            d="M10 9 H17 M15 6.5 L17.5 9 L15 11.5"
            stroke="#fafaf8"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="19.5"
            y="2.5"
            width="10"
            height="13"
            rx="1.5"
            fill="none"
            stroke="#fafaf8"
            strokeWidth="1.6"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
