"use client";

import { useEffect, useRef } from "react";

/**
 * Multiplex Ad (Autorelaxed format)
 * Slot: 7907587470
 * Best for: end of page, recommendation-style grid
 */
export default function AdMultiplex({ className = "" }: { className?: string }) {
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
        style={{ display: "block" }}
        data-ad-format="autorelaxed"
        data-ad-client="ca-pub-1712738170439989"
        data-ad-slot="7907587470"
      />
    </div>
  );
}
