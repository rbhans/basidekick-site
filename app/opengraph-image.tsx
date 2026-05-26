import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";

// Runs on Fluid Compute (Node.js). Edge runtime is no longer recommended for
// OG image generation. Fonts are bundled from app/_fonts/ via import.meta.url
// so Next.js traces them into the deployment output — no runtime network fetch.
export const alt = "BASidekick — BAS info, community, and resources";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors public/brand/social-banner.svg. Keep the two in sync when copy or
// layout changes.
export default async function Image() {
  // Satori reads TTF/OTF/WOFF — not WOFF2 (no Brotli decode in-process).
  // Fonts come from @fontsource and are bundled via import.meta.url.
  const [archivo, archivoBlack] = await Promise.all([
    readFile(new URL("./_fonts/Archivo-Regular.woff", import.meta.url)),
    readFile(new URL("./_fonts/ArchivoBlack-Regular.woff", import.meta.url)),
  ]);

  const fonts: { name: string; data: Buffer; style: "normal"; weight: 400 | 900 }[] = [
    { name: "Archivo", data: archivo, style: "normal", weight: 400 },
    { name: "ArchivoBlack", data: archivoBlack, style: "normal", weight: 900 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#fafaf8",
          color: "#0a0a0a",
          fontFamily: "Archivo, system-ui, sans-serif",
        }}
      >
        {/* Top status strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "14px",
            color: "rgba(10,10,10,0.44)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily: "ui-monospace, Menlo, monospace",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#d11a36",
              }}
            />
            SYS NOMINAL
          </span>
          <span style={{ color: "rgba(10,10,10,0.22)" }}>·</span>
          <span>INDEPENDENT BAS TOOLKIT</span>
        </div>

        {/* Manifesto */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              color: "rgba(10,10,10,0.44)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "ui-monospace, Menlo, monospace",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ color: "#d11a36" }}>.01</span>
            BASIDEKICK
          </div>
          <div
            style={{
              fontSize: "64px",
              fontFamily: "ArchivoBlack, Archivo, system-ui, sans-serif",
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              color: "#0a0a0a",
              maxWidth: "1000px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            BAS info, community, and resources —{" "}
            <span style={{ color: "#d11a36", fontStyle: "italic", fontWeight: 900 }}>
              built by a working engineer
            </span>
            , independent of any vendor.
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "14px",
            color: "rgba(10,10,10,0.44)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            paddingTop: "24px",
            borderTop: "1px solid rgba(10,10,10,0.08)",
            fontFamily: "ui-monospace, Menlo, monospace",
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#d11a36" }}>BASIDEKICK</span>
            <span style={{ color: "rgba(10,10,10,0.22)", margin: "0 14px" }}>·</span>
            <span style={{ color: "#0a0a0a" }}>BASIDEKICK.COM</span>
          </span>
          <span>ATLAS · POINTSTACK · WIKI · NEWS · SOURCE</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    },
  );
}
