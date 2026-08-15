import { ImageResponse } from "next/og";

// Site-wide link preview. next/og renders this at build time — no image asset to
// keep in sync, and any page without its own card inherits it.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "REY — Game Dev Club";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0f",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, #1e3a5f 0%, transparent 45%), radial-gradient(circle at 75% 80%, #5f1e1e 0%, transparent 45%)",
          color: "white",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 160, letterSpacing: 24, fontWeight: 700 }}>REY</div>
        <div style={{ fontSize: 34, letterSpacing: 8, color: "#8ab4d8", marginTop: 12 }}>
          GAME DEV CLUB
        </div>
        <div style={{ fontSize: 24, letterSpacing: 3, color: "#7a7a85", marginTop: 40 }}>
          build · jam · ship
        </div>
      </div>
    ),
    size
  );
}
