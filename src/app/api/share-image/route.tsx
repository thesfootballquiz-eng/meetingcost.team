import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const duration = searchParams.get("duration") || "0m";
  const participants = searchParams.get("participants") || "0";
  const cost = searchParams.get("cost") || "$0.00";
  const title = searchParams.get("title") || "Meeting Cost Report";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0a 0%, #0c1f1a 40%, #0a0a0a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage:
              "linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            height: "4px",
            background: "linear-gradient(90deg, #10b981, #06b6d4, #3b82f6)",
            width: "100%",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "40px 60px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #34d399, #06b6d4)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "22px",
              }}
            >
              $
            </div>
            <span style={{ color: "#ffffff", fontSize: "26px", fontWeight: "bold" }}>
              MeetingCost
              <span style={{ color: "#34d399" }}>.team</span>
            </span>
          </div>
          <span
            style={{
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            {title}
          </span>
        </div>

        {/* Main cost display */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "0 60px",
          }}
        >
          <div
            style={{
              color: "#9ca3af",
              fontSize: "18px",
              textTransform: "uppercase",
              letterSpacing: "4px",
              marginBottom: "16px",
            }}
          >
            Total Meeting Cost
          </div>
          <div
            style={{
              fontSize: cost.length > 20 ? "72px" : "96px",
              fontWeight: "bold",
              color: "#34d399",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            {cost}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "80px",
            padding: "0 60px 50px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ color: "#6b7280", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px" }}>
                Duration
              </span>
            </div>
            <span style={{ color: "#e5e7eb", fontSize: "32px", fontWeight: "bold" }}>
              {duration}
            </span>
          </div>

          <div style={{ width: "1px", background: "#374151" }} />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" stroke="#6b7280" strokeWidth="2" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ color: "#6b7280", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px" }}>
                Participants
              </span>
            </div>
            <span style={{ color: "#e5e7eb", fontSize: "32px", fontWeight: "bold" }}>
              {participants}
            </span>
          </div>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            borderTop: "1px solid rgba(16, 185, 129, 0.2)",
            padding: "16px 60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: "#9ca3af", fontSize: "16px" }}>
            Check your meeting cost at
          </span>
          <span style={{ color: "#34d399", fontSize: "16px", fontWeight: "bold" }}>
            meetingcost.team
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
