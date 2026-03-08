"use client";

import { useEffect, useRef } from "react";

/**
 * In-Article Ad (Fluid format)
 * Slot: 1869731119
 * Best for: inside long content like blog posts
 */
export default function AdInArticle({ className = "" }: { className?: string }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  return (
    <div className={`ad-container my-8 ${className}`} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-5262734754559750"
        data-ad-slot="1869731119"
      />
    </div>
  );
}
