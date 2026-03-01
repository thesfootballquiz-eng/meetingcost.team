import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MeetingCost.team - Real-Time Meeting Cost Calculator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #064e3b 0%, #0f172a 50%, #1e3a5f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 90,
            marginBottom: 24,
          }}
        >
          💰
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            color: "#34d399",
            marginBottom: 20,
            letterSpacing: "-1px",
          }}
        >
          MeetingCost.team
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#9ca3af",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Real-Time Meeting Cost Calculator
        </div>
        <div
          style={{
            marginTop: 48,
            background: "rgba(52,211,153,0.15)",
            border: "1px solid rgba(52,211,153,0.3)",
            borderRadius: 12,
            padding: "12px 32px",
            color: "#34d399",
            fontSize: 22,
          }}
        >
          Free • Multi-currency • Real-time
        </div>
      </div>
    ),
    { ...size }
  );
}
