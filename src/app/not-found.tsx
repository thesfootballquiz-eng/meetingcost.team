import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#030712", color: "#f9fafb", fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#34d399", marginBottom: 16 }}>404</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Page not found</h1>
          <Link href="/en" style={{ color: "#34d399", textDecoration: "none" }}>
            ← Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
