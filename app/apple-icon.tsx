import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 96,
          background: "#d11a36",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fafaf8",
          fontFamily: "monospace",
          fontWeight: 900,
          letterSpacing: "-0.05em",
        }}
      >
        BSK
      </div>
    ),
    {
      ...size,
    }
  );
}
