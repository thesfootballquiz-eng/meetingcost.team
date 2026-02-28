import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#064e3b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "40px",
        }}
      >
        <div
          style={{
            color: "#34d399",
            fontSize: "110px",
            fontWeight: "bold",
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          $
        </div>
      </div>
    ),
    { ...size }
  );
}
