import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BASidekick — BAS info, community, and resources";
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
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#fafaf8",
          color: "#0a0a0a",
          fontFamily: "monospace",
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
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              color: "rgba(10,10,10,0.44)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "monospace",
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
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: "#0a0a0a",
              maxWidth: "950px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            BAS info, community, and resources —{" "}
            <span style={{ color: "#d11a36", fontStyle: "italic", fontWeight: 800 }}>
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
            fontSize: "16px",
            color: "rgba(10,10,10,0.44)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            paddingTop: "24px",
            borderTop: "1px solid rgba(10,10,10,0.08)",
          }}
        >
          <span>
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
    }
  );
}
