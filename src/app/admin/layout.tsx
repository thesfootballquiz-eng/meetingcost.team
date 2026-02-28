import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/favicon.ico" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
