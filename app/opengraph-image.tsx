import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "basidekick - Tools for BAS Professionals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          background: "linear-gradient(145deg, #09090b 0%, #18181b 100%)",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(161, 161, 170, 0.15) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Logo/Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#22c55e",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "28px", color: "#09090b", fontWeight: "bold" }}>B</span>
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#fafafa",
              fontFamily: "monospace",
            }}
          >
            basidekick
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#a1a1aa",
            marginBottom: "48px",
            fontFamily: "monospace",
          }}
        >
          Tools for BAS Professionals
        </div>

        {/* Features row */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            color: "#71717a",
            fontSize: "20px",
            fontFamily: "monospace",
          }}
        >
          <span>NiagaraSidekick</span>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span>SimulatorSidekick</span>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span>MetasysSidekick</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
